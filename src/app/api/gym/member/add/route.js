import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { sendOnboardingEmail } from "@/lib/mailer";

export async function POST(request) {
  // 1. Authenticate the gym
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "gym") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const gymId = session.user.id;

  try {
    const body = await request.json();
    const {
      email,
      firstName,
      lastName,
      role,
      subscriptionTypeId,
      startDate,
      endDate,
    } = body;

    // 2. Validate input
    if (
      !email ||
      !firstName ||
      !lastName ||
      !role ||
      !subscriptionTypeId ||
      !startDate ||
      !endDate
    ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 3. Check if user already exists
      let user = await tx.user.findUnique({ where: { email } });

      if (!user) {
        user = await tx.user.create({
          data: {
            email,
            firstName,
            lastName,
          },
        });
      }

      // 4. Check if user is already a member of this gym
      const existingMembership = await tx.gymMembership.findUnique({
        where: { userId_gymId: { userId: user.id, gymId: gymId } },
      });

      if (existingMembership) {
        throw new Error("User is already a member of this gym");
      }

      // 5. Create a pending membership
      const membership = await tx.gymMembership.create({
        data: {
          userId: user.id,
          gymId: gymId,
          role: role,
          subscriptionTypeId: subscriptionTypeId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: "PENDING_SETUP",
        },
      });

      // 6. Generate onboarding token
      await tx.onboardingToken.deleteMany({
        where: { userId: user.id },
      });

      const randomBytes = crypto.getRandomValues(new Uint8Array(32));
      const tokenValue = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const tokenExpires = new Date(Date.now() + 72 * 60 * 60 * 1000);

      await tx.onboardingToken.create({
        data: {
          userId: user.id,
          token: tokenValue,
          expires: tokenExpires,
        },
      });

      return { user, tokenValue };
    });

    // 7. Send onboarding email
    await sendOnboardingEmail(result.user.email, result.tokenValue);

    return NextResponse.json(
      { message: "Member added and email sent" },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADD_MEMBER_ERROR", error);
    if (error.message === "User is already a member of this gym") {
      return new NextResponse(error.message, { status: 409 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
