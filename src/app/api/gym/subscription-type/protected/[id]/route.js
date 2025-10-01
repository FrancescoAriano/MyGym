import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

async function getSubscriptionAndVerifyOwnership(subscriptionId, gymId) {
  const subscriptionType = await prisma.subscriptionType.findFirst({
    where: { id: subscriptionId, gymId: gymId },
  });
  if (!subscriptionType) {
    throw new Error("Subscription not found or access denied");
  }
  return subscriptionType;
}

export async function PUT(request, { params }) {
  // 1. Check authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user.entityType !== "gym") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 2. Verify subscription ownership
    await getSubscriptionAndVerifyOwnership(params.id, session.user.id);
    const body = await request.json();
    const { name, description, price, durationValue, durationUnit } = body;

    // 3. Validation
    if (!name || !price || !durationValue || !durationUnit) {
      return new NextResponse(
        "name, price, durationValue, and durationUnit are required",
        { status: 400 }
      );
    }

    // 4. Update the subscription type
    const updated = await prisma.subscriptionType.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price: parseFloat(price),
        durationValue: parseInt(durationValue),
        durationUnit,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error.code === "P2002") {
      return new NextResponse(
        "A subscription with these details already exists.",
        { status: 409 }
      );
    }
    console.error("UPDATE_SUBSCRIPTION_ERROR", error);
    return new NextResponse(error.message, {
      status: error.message.includes("access denied") ? 404 : 500,
    });
  }
}

export async function DELETE(request, { params }) {
  // 1. Check authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user.entityType !== "gym") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 2. Verify subscription ownership
    await getSubscriptionAndVerifyOwnership(params.id, session.user.id);

    // 3. Soft delete the subscription type
    await prisma.subscriptionType.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse(error.message, {
      status: error.message.includes("access denied") ? 404 : 500,
    });
  }
}

export async function PATCH(request, { params }) {
  // 1. Check authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user.entityType !== "gym") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 2. Verify subscription ownership
    await getSubscriptionAndVerifyOwnership(params.id, session.user.id);

    // 3. Reactivate the subscription type
    const updated = await prisma.subscriptionType.update({
      where: { id: params.id },
      data: { isActive: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return new NextResponse(error.message, {
      status: error.message.includes("access denied") ? 404 : 500,
    });
  }
}
