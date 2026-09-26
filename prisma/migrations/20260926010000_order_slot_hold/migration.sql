-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "holdExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "orders_status_holdExpiresAt_idx" ON "orders"("status", "holdExpiresAt");

-- Backfill: existing unpaid online checkouts get a hold that expires one hour
-- after they were created, so slots stuck by past abandoned checkouts are
-- released by the next sweep. Manual orders are left untouched (null).
UPDATE "orders" o
SET "holdExpiresAt" = o."createdAt" + INTERVAL '1 hour'
WHERE o."status" = 'PENDING'
  AND o."source" = 'ONLINE'
  AND NOT EXISTS (
    SELECT 1 FROM "payments" p
    WHERE p."orderId" = o."id" AND p."status" = 'PAID'
  );
