import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendGymVerificationEmail } from "@/lib/mailer";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    // 1. Validate input
    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    // 2. Check if gym exists and is not verified
    const gym = await prisma.gym.findUnique({
      where: { email },
    });

    if (!gym || gym.emailVerified) {
      return new NextResponse("Gym not found or email already verified", {
        status: 200,
      });
    }

    // 3. Generate a new verification token
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const tokenValue = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const tokenExpires = new Date(new Date().getTime() + 72 * 60 * 60 * 1000);

    await prisma.gymVerificationToken.upsert({
      where: { gymId: gym.id },
      update: {
        token: tokenValue,
        expires: tokenExpires,
      },
      create: {
        gymId: gym.id,
        token: tokenValue,
        expires: tokenExpires,
      },
    });

    // 4. Send verification email
    await sendGymVerificationEmail(gym.email, tokenValue);

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("RESEND_VERIFICATION_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
