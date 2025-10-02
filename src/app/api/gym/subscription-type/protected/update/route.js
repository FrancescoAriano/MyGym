import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PUT(request) {
  // 1. Authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user.entityType !== "gym") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 2. Validate
    const { id, name, description, price, durationValue, durationUnit } =
      await request.json();
    if (!id) {
      return new NextResponse("Subscription ID is required", { status: 400 });
    }

    // 3. Verify ownership
    const subscriptionType = await prisma.subscriptionType.findFirst({
      where: { id: id, gymId: session.user.id },
    });
    if (!subscriptionType) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // 4. Validate required fields
    if (!name || !price || !durationValue || !durationUnit) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // 5. Update subscription
    const updated = await prisma.subscriptionType.update({
      where: { id: id },
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
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
