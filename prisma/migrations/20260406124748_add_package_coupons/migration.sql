-- CreateEnum
CREATE TYPE "CouponScope" AS ENUM ('EVENT', 'PACKAGE');

-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "scopeType" "CouponScope" NOT NULL DEFAULT 'EVENT';

-- CreateTable
CREATE TABLE "_CouponToPackages" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CouponToPackages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CouponToPackages_B_index" ON "_CouponToPackages"("B");

-- AddForeignKey
ALTER TABLE "_CouponToPackages" ADD CONSTRAINT "_CouponToPackages_A_fkey" FOREIGN KEY ("A") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CouponToPackages" ADD CONSTRAINT "_CouponToPackages_B_fkey" FOREIGN KEY ("B") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
