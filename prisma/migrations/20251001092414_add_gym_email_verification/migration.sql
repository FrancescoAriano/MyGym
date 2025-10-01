-- AlterTable
ALTER TABLE "Gym" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "GymVerificationToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "gymId" TEXT NOT NULL,

    CONSTRAINT "GymVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GymVerificationToken_token_key" ON "GymVerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "GymVerificationToken_gymId_key" ON "GymVerificationToken"("gymId");

-- AddForeignKey
ALTER TABLE "GymVerificationToken" ADD CONSTRAINT "GymVerificationToken_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
