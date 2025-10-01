/*
  Warnings:

  - A unique constraint covering the columns `[name,gymId]` on the table `SubscriptionType` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionType_name_gymId_key" ON "SubscriptionType"("name", "gymId");
