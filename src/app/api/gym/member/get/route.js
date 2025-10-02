import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request) {
  // 1. Authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user.entityType !== "gym") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const gymId = session.user.id;

  try {
    // 2. Fetch all members for the authenticated gym
    const memberships = await prisma.gymMembership.findMany({
      where: { gymId: gymId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        subscriptionType: true,
      },
      orderBy: [{ user: { lastName: "asc" } }, { user: { firstName: "asc" } }],
    });

    return NextResponse.json(memberships);
  } catch (error) {
    console.error("GET_MEMBERS_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
