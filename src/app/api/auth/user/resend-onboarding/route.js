import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendOnboardingEmail } from "@/lib/mailer";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    // 1. Validate input
    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    // 2. Check if user exists and is not verified
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.hashedPassword) {
      return new NextResponse("User not found or already registered", {
        status: 200,
      });
    }

    // 3. Generate a new verification token
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const tokenValue = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const tokenExpires = new Date(new Date().getTime() + 72 * 60 * 60 * 1000);

    await prisma.onboardingToken.upsert({
      where: { userId: user.id },
      update: {
        token: tokenValue,
        expires: tokenExpires,
      },
      create: {
        userId: user.id,
        token: tokenValue,
        expires: tokenExpires,
      },
    });

    // 4. Send verification email
    await sendOnboardingEmail(user.email, tokenValue);

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("RESEND_ONBOARDING_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
