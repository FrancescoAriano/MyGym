import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PATCH(request) {
  // 1. Check authentication
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
    // 3. Verify subscription ownership
    const subscriptionType = await prisma.subscriptionType.findFirst({
      where: { id: id, gymId: session.user.id },
    });
    if (!subscriptionType) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // 4. Soft delete the subscription type
    await prisma.subscriptionType.update({
      where: { id: id },
      data: { isActive: false },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("ARCHIVE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
