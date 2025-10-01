import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendAdminGymRegistrationNotification } from "@/lib/mailer";

export async function POST(request) {
  try {
    const body = await request.json();
    const { token } = body;

    // 1. Validate input
    if (!token) {
      return new NextResponse("Missing token", { status: 400 });
    }

    // 2. Verify token
    const verificationToken = await prisma.gymVerificationToken.findUnique({
      where: { token },
      include: { gym: true },
    });

    if (!verificationToken) {
      return new NextResponse("Invalid or expired token", { status: 400 });
    }

    if (new Date(verificationToken.expires) < new Date()) {
      await prisma.gymVerificationToken.delete({ where: { token } });
      return new NextResponse("Token has expired", { status: 410 });
    }

    await prisma.$transaction(async (tx) => {
      // 4. Activate account
      await tx.gym.update({
        where: { id: verificationToken.gymId },
        data: { emailVerified: true },
      });

      // 6. Delete the used token
      await tx.gymVerificationToken.delete({
        where: { id: verificationToken.id },
      });
    });

    // 5. Notify admins about new gym registration
    await sendAdminGymRegistrationNotification(verificationToken.gym);

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("VERIFY_EMAIL_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
