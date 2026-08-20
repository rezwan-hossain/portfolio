-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('ONLINE', 'MANUAL');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "source" "OrderSource" NOT NULL DEFAULT 'ONLINE';
