import { NextResponse } from "next/server";
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
    // 2. Fetch active subscription types for the specified gym
    const subscriptionTypes = await prisma.subscriptionType.findMany({
      where: { gymId: gymId, isActive: true },
      orderBy: [{ name: "asc" }, { durationValue: "asc" }, { price: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        durationValue: true,
        durationUnit: true,
      },
    });
    return NextResponse.json(subscriptionTypes);
  } catch (error) {
    console.error("PUBLIC_GET_SUBSCRIPTIONS_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
