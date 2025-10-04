import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

/**
 * GET /api/trainer/clients
 * Restituisce tutti i clienti delle palestre dove il trainer lavora
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
    // Trova le palestre dove il trainer lavora
    const trainerMemberships = await prisma.gymMembership.findMany({
      where: {
        userId: session.user.id,
        role: "TRAINER",
      },
      select: {
        gymId: true,
      },
    });

    const gymIds = trainerMemberships.map((m) => m.gymId);

    if (gymIds.length === 0) {
      return NextResponse.json([]);
    }

    // Trova tutti i clienti di quelle palestre
    const clients = await prisma.gymMembership.findMany({
      where: {
        gymId: {
          in: gymIds,
        },
        role: "CLIENT",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        gym: {
          select: {
            id: true,
            name: true,
          },
        },
        subscriptionType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        user: {
          firstName: "asc",
        },
      },
    });

    // Formatta i dati per la risposta
    const formattedClients = clients.map((membership) => ({
      id: membership.id,
      userId: membership.user.id,
      firstName: membership.user.firstName,
      lastName: membership.user.lastName,
      email: membership.user.email,
      gymId: membership.gym.id,
      gymName: membership.gym.name,
      subscriptionType: membership.subscriptionType.name,
      status: membership.status,
      startDate: membership.startDate,
      endDate: membership.endDate,
    }));

    return NextResponse.json(formattedClients);
  } catch (error) {
    console.error("GET_TRAINER_CLIENTS_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
