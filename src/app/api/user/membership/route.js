import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

/**
 * GET /api/user/membership
 * Ottiene i dati dell'abbonamento dell'utente loggato
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.entityType !== "user") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // Trova la membership dell'utente
    const membership = await prisma.gymMembership.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
      include: {
        subscriptionType: true,
        gym: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Nessun abbonamento attivo trovato" },
        { status: 404 }
      );
    }

    // Formatta i dati per il frontend
    const formattedMembership = {
      type: membership.subscriptionType?.name || "Abbonamento",
      status: membership.status === "ACTIVE" ? "active" : "inactive",
      startDate: membership.startDate,
      endDate: membership.endDate,
      price: membership.subscriptionType?.price
        ? membership.subscriptionType.price.toString()
        : "0",
      gymName: membership.gym?.name || "Palestra",
    };

    return NextResponse.json(formattedMembership);
  } catch (error) {
    console.error("Error fetching user membership:", error);
    return NextResponse.json(
      { error: "Errore nel recupero dei dati abbonamento" },
      { status: 500 }
    );
  }
}
