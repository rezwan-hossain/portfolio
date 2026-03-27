/*
  Warnings:

  - You are about to drop the column `bkashTrxId` on the `payments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transactionId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "payments_bkashTrxId_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "bkashTrxId",
ADD COLUMN     "paymentGateway" TEXT,
ADD COLUMN     "transactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");
