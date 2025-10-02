import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(request) {
  // 1. Authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user.entityType !== "gym") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const gymId = session.user.id;

  try {
    // 2. Validate
    const { subscriptions } = await request.json();
    if (
      !subscriptions ||
      !Array.isArray(subscriptions) ||
      subscriptions.length === 0
    ) {
      return new NextResponse("Array of subscriptions is required", {
        status: 400,
      });
    }

    // 3. Validate each subscription and prepare data
    const dataToCreate = subscriptions.map((sub) => {
      if (!sub.name || !sub.price || !sub.durationValue || !sub.durationUnit) {
        return new NextResponse(
          "Each subscription must have name, price, durationValue, and durationUnit",
          { status: 400 }
        );
      }
      return {
        name: sub.name,
        description: sub.description || null,
        price: parseFloat(sub.price),
        durationValue: parseInt(sub.durationValue),
        durationUnit: sub.durationUnit,
        gymId: gymId,
      };
    });

    // 4. Create subscriptions
    const createdSubscriptions = await prisma.$transaction(
      dataToCreate.map((subData) =>
        prisma.subscriptionType.create({ data: subData })
      )
    );
    return NextResponse.json(createdSubscriptions, { status: 201 });
  } catch (error) {
    if (error.code === "P2002") {
      return new NextResponse(
        "One or more of the specified subscriptions already exist",
        { status: 409 }
      );
    }
    console.error("CREATE_SUBSCRIPTIONS_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
