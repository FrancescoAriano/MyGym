import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PUT(request, { params }) {
  // 1. Check authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user.entityType !== "gym") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const gymId = session.user.id;
  const awaitedParams = await params;
  const { id: subscriptionId } = awaitedParams;

  try {
    const body = await request.json();
    const { name, description } = body;

    // 2. Validation
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }
    if (!subscriptionId) {
      return new NextResponse("Subscription ID is required", { status: 400 });
    }

    // 3. Verify subscription
    const subscriptionType = await prisma.subscriptionType.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscriptionType || subscriptionType.gymId !== gymId) {
      return new NextResponse("Subscription Type not found or access denied", {
        status: 404,
      });
    }

    // 4. Update in the database
    const updatedSubscriptionType = await prisma.subscriptionType.update({
      where: {
        id: subscriptionId,
      },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(updatedSubscriptionType, { status: 200 });
  } catch (error) {
    if (error.code === "P2002") {
      return new NextResponse(
        "A subscription with this name already exists for your gym.",
        { status: 409 }
      );
    }
    console.error("UPDATE_SUBSCRIPTION_TYPE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  // 1. Check authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user.entityType !== "gym") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const gymId = session.user.id;
  const awaitedParams = await params;
  const { id: subscriptionId } = awaitedParams;

  try {
    // 2. Validation
    if (!subscriptionId) {
      return new NextResponse("Subscription ID is required", { status: 400 });
    }

    // 3. Verify subscription
    const subscriptionType = await prisma.subscriptionType.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscriptionType || subscriptionType.gymId !== gymId) {
      return new NextResponse("Subscription Type not found or access denied", {
        status: 404,
      });
    }

    // 4. Soft delete in the database
    await prisma.subscriptionType.update({
      where: { id: subscriptionId },
      data: { isActive: false },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DEACTIVATE_SUBSCRIPTION_TYPE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  // 1. Check authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user.entityType !== "gym") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const gymId = session.user.id;
  const awaitedParams = await params;
  const { id: subscriptionId } = awaitedParams;

  try {
    // 2. Validation
    if (!subscriptionId) {
      return new NextResponse("Subscription ID is required", { status: 400 });
    }

    // 3. Verify subscription belongs to this gym
    const subscriptionType = await prisma.subscriptionType.findFirst({
      where: { id: subscriptionId, gymId: gymId },
    });
    if (!subscriptionType) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // 4. Reactivate the subscription type
    const updatedSubscription = await prisma.subscriptionType.update({
      where: { id: subscriptionId },
      data: { isActive: true },
    });

    return NextResponse.json(updatedSubscription, { status: 200 });
  } catch (error) {
    console.error("REACTIVATE_SUBSCRIPTION_TYPE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
