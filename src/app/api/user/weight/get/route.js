import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request) {
  // 1. Authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 2. Extract userId from query parameters
  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get("userId");
  if (!targetUserId) {
    return new NextResponse("userId parameter is required", { status: 400 });
  }

  let hasPermission = false;

  // 3. User authorization logic
  if (session.user.entityType === "user" && session.user.id === targetUserId) {
    hasPermission = true;
  }

  // 4. Gym authorization logic
  if (session.user.entityType === "gym") {
    const membership = await prisma.gymMembership.findUnique({
      where: { userId_gymId: { userId: targetUserId, gymId: session.user.id } },
    });
    if (membership) hasPermission = true;
  }

  // 5. Trainer authorization logic
  if (session.user.entityType === "user" && session.user.role === "TRAINER") {
    const trainerGyms = await prisma.gymMembership.findMany({
      where: { userId: session.user.id },
      select: { gymId: true },
    });
    const trainerGymIds = trainerGyms.map((g) => g.gymId);

    const userMembership = await prisma.gymMembership.findFirst({
      where: {
        userId: targetUserId,
        gymId: { in: trainerGymIds },
      },
    });
    if (userMembership) hasPermission = true;
  }

  if (!hasPermission) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 6. Fetch weight entries for the target user
  try {
    const weightEntries = await prisma.weightEntry.findMany({
      where: { userId: targetUserId },
      orderBy: { date: "asc" },
    });
    return NextResponse.json(weightEntries);
  } catch (error) {
    console.error("GET_WEIGHT_ENTRIES_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
