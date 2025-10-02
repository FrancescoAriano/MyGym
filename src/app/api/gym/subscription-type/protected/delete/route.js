import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function DELETE(request) {
  // 1. Authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user.entityType !== "gym") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 2. Validate
  const { id } = await request.json();
  if (!id) {
    return new NextResponse("Subscription ID is required", { status: 400 });
  }

  try {
    // 3. Verify ownership
    const subscriptionType = await prisma.subscriptionType.findFirst({
      where: { id: id, gymId: session.user.id },
    });
    if (!subscriptionType) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // 4. Verify if in use
    const usageCount = await prisma.gymMembership.count({
      where: { subscriptionTypeId: id },
    });

    if (usageCount > 0) {
      return new NextResponse(
        "Cannot delete this subscription because it is currently in use by members",
        { status: 409 }
      );
    }

    // 5. Permanent delete
    await prisma.subscriptionType.delete({
      where: { id: id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
