import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const gymId = searchParams.get("gymId");

  // 1. Validation
  if (!gymId) {
    return new NextResponse("gymId query parameter is required", {
      status: 400,
    });
  }

  try {
    // 2. Fetch all subscription types for this gym
    const subscriptionTypes = await prisma.subscriptionType.findMany({
      where: { gymId: gymId, isActive: true },
      orderBy: [
        { name: "asc" },
        { durationValue: "asc" },
        { durationUnit: "asc" },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        durationValue: true,
        durationUnit: true,
      },
    });

    return NextResponse.json(subscriptionTypes, { status: 200 });
  } catch (error) {
    console.error("GET_SUBSCRIPTION_TYPES_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
