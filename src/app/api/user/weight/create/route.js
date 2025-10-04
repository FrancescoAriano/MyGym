import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(request) {
  // 1. Authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user.entityType !== "user") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;

  try {
    // 2. Parse and validate input
    const { weight, date } = await request.json();
    if (!weight || !date) {
      return new NextResponse("Weight and date are required", { status: 400 });
    }

    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);

    // 3. Upsert logic: check if entry exists for the date, then update or create
    const result = await prisma.$transaction(async (tx) => {
      const existingEntry = await tx.weightEntry.findFirst({
        where: {
          userId: userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      if (existingEntry) {
        return tx.weightEntry.update({
          where: {
            id: existingEntry.id,
          },
          data: {
            weight: parseFloat(weight),
          },
        });
      } else {
        return tx.weightEntry.create({
          data: {
            userId: userId,
            weight: parseFloat(weight),
            date: startDate,
          },
        });
      }
    });

    return NextResponse.json(
      { message: "Weight added succesfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPSERT_WEIGHT_ENTRY_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
