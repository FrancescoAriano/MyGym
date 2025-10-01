import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    // 1. Validate input
    if (!token || !password) {
      return new NextResponse("Missing token or password", { status: 400 });
    }

    if (password.length < 6) {
      return new NextResponse("Password must be at least 6 characters long", {
        status: 400,
      });
    }

    // 2. Verify token
    const onboardingToken = await prisma.onboardingToken.findUnique({
      where: { token },
    });

    if (!onboardingToken) {
      return new NextResponse("Invalid or expired token", { status: 400 });
    }

    if (new Date(onboardingToken.expires) < new Date()) {
      await prisma.onboardingToken.delete({ where: { token } });
      return new NextResponse("Token has expired", { status: 410 });
    }

    // 3. Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      // 4. Update user's password and activate account
      await tx.user.update({
        where: { id: onboardingToken.userId },
        data: { hashedPassword },
      });

      // 5. Update gym membership to active
      const pendingMemberships = await tx.gymMembership.findMany({
        where: {
          userId: onboardingToken.userId,
          status: "PENDING_SETUP",
        },
      });

      const now = new Date();
      for (const membership of pendingMemberships) {
        const isExpired = new Date(membership.endDate) < now;

        await tx.gymMembership.update({
          where: { id: membership.id },
          data: {
            status: isExpired ? "EXPIRED" : "ACTIVE",
          },
        });
      }

      // 6. Delete the used token
      await tx.onboardingToken.delete({ where: { id: onboardingToken.id } });
    });

    return NextResponse.json(
      { message: "Password set successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("SET_PASSWORD_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
