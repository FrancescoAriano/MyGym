import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request) {
  // 1. Check authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user.entityType !== "gym") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const gymId = session.user.id;

  try {
    // 2. Fetch subscription types for this gym
    const subscriptionTypes = await prisma.subscriptionType.findMany({
      where: {
        gymId: gymId,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(subscriptionTypes, { status: 200 });
  } catch (error) {
    console.error("GET_SUBSCRIPTION_TYPES_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request) {
  // 1. Check authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user.entityType !== "gym") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const gymId = session.user.id;

  try {
    const body = await request.json();
    const { name, description } = body;

    // 2. Validation
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // 3. Check if subscription type with this name already exists for this gym
    const existingSubscriptionType = await prisma.subscriptionType.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        gymId: gymId,
      },
    });

    if (existingSubscriptionType) {
      return new NextResponse(
        "A subscription type with this name already exists",
        { status: 409 }
      );
    }

    // 4. Create new subscription type
    const newSubscriptionType = await prisma.subscriptionType.create({
      data: {
        name,
        description,
        gymId: gymId,
      },
    });

    return NextResponse.json(newSubscriptionType, { status: 201 });
  } catch (error) {
    console.error("CREATE_SUBSCRIPTION_TYPE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
