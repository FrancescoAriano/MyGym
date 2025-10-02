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
  const gymId = session.user.id;

  try {
    // 2. Validation
    const body = await request.json();
    const { userId, userData, membershipData } = body;

    if (!userId || (!userData && !membershipData)) {
      return new NextResponse("User ID and data to update are required", {
        status: 400,
      });
    }

    // 3. Verify membership existence
    const existingMembership = await prisma.gymMembership.findUnique({
      where: { userId_gymId: { userId, gymId } },
    });

    if (!existingMembership) {
      return new NextResponse("Member not found in this gym", { status: 404 });
    }

    const updatedMembership = await prisma.$transaction(async (tx) => {
      // 4. Update user and membership data if provided
      if (userData) {
        await tx.user.update({
          where: { id: userId },
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
          },
        });
      }

      // 5. Update membership data if provided
      if (membershipData) {
        await tx.gymMembership.update({
          where: { userId_gymId: { userId, gymId } },
          data: {
            role: membershipData.role,
            subscriptionTypeId: membershipData.subscriptionTypeId,
            startDate: membershipData.startDate
              ? new Date(membershipData.startDate)
              : undefined,
            endDate: membershipData.endDate
              ? new Date(membershipData.endDate)
              : undefined,
            status: membershipData.status,
          },
        });
      }

      // 6. Return updated membership with user details
      return tx.gymMembership.findUnique({
        where: { userId_gymId: { userId, gymId } },
        include: { user: true, subscriptionType: true },
      });
    });

    return NextResponse.json(updatedMembership);
  } catch (error) {
    console.error("UPDATE_MEMBER_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
