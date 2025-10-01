import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { sendGymVerificationEmail } from "@/lib/mailer";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, phoneNumber, address, latitude, longitude } =
      body;

    // 1. Basic validation
    if (
      !name ||
      !email ||
      !password ||
      !phoneNumber ||
      !address ||
      !latitude ||
      !longitude
    ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // 2. Check if user already exists
    const existingGym = await prisma.gym.findUnique({
      where: { email },
    });

    if (existingGym) {
      return new NextResponse("Gym with this email already exists", {
        status: 409,
      });
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // 4. Create the gym in the database
      let gym = await tx.gym.create({
        data: {
          name,
          email,
          hashedPassword,
          phoneNumber,
          address,
          latitude,
          longitude,
        },
      });

      // 5. Generate verification token
      const randomBytes = crypto.getRandomValues(new Uint8Array(32));
      const tokenValue = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const tokenExpires = new Date(Date.now() + 72 * 60 * 60 * 1000);

      await tx.GymVerificationToken.create({
        data: {
          gymId: gym.id,
          token: tokenValue,
          expires: tokenExpires,
        },
      });

      return { ...gym, tokenValue };
    });

    // 6. Send verification email to the gym
    await sendGymVerificationEmail(result.email, result.tokenValue);

    return NextResponse.json(
      { message: "Gym added and email sent" },
      { status: 201 }
    );
  } catch (error) {
    console.error("GYM_REGISTRATION_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
