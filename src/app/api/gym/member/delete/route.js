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
  const gymId = session.user.id;

  try {
    // 2. Validation
    const { userId } = await request.json();
    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // 3. Remove membership
    await prisma.gymMembership.delete({
      where: {
        userId_gymId: {
          userId: userId,
          gymId: gymId,
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error.code === "P2025") {
      return new NextResponse("Member not found in this gym", { status: 404 });
    }
    console.error("DELETE_MEMBER_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
