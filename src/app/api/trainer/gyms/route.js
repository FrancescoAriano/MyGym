import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

/**
 * GET /api/trainer/gyms
 * Restituisce le palestre dove il trainer lavora
 */
export async function GET(request) {
  const session = await getServerSession(authOptions);

  // Verifica autenticazione e ruolo
  if (
    !session ||
    session.user.entityType !== "user" ||
    session.user.role !== "TRAINER"
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Trova tutte le membership del trainer
    const memberships = await prisma.gymMembership.findMany({
      where: {
        userId: session.user.id,
        role: "TRAINER",
      },
      include: {
        gym: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            address: true,
          },
        },
      },
    });

    // Estrai le informazioni delle palestre
    const gyms = memberships.map((m) => m.gym);

    return NextResponse.json(gyms);
  } catch (error) {
    console.error("GET_TRAINER_GYMS_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
