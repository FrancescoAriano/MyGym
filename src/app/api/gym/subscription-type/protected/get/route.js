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
    // 2. Fetch all subscription types for the authenticated gym
    const subscriptionTypes = await prisma.subscriptionType.findMany({
      where: { gymId: gymId },
      orderBy: [{ name: "asc" }, { durationValue: "asc" }, { price: "asc" }],
    });
    return NextResponse.json(subscriptionTypes);
  } catch (error) {
    console.error("GET_SUBSCRIPTION_TYPES_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
