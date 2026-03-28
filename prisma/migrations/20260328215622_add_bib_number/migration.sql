-- 1. Add columns as NULLABLE
ALTER TABLE "registrations" ADD COLUMN "eventId" TEXT;
ALTER TABLE "registrations" ADD COLUMN "bibNumber" TEXT;

-- 2. Backfill eventId from orders
UPDATE "registrations" r
SET "eventId" = o."eventId"
FROM "orders" o
WHERE r."orderId" = o."id";

-- 3. Make eventId NOT NULL
ALTER TABLE "registrations" ALTER COLUMN "eventId" SET NOT NULL;

-- 4. Add foreign key
ALTER TABLE "registrations"
ADD CONSTRAINT "registrations_eventId_fkey"
FOREIGN KEY ("eventId") REFERENCES "events"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- 5. Add unique constraint for BIB per event
ALTER TABLE "registrations"
ADD CONSTRAINT "registrations_eventId_bibNumber_key"
UNIQUE ("eventId", "bibNumber");

-- 6. Add index
CREATE INDEX "registrations_eventId_idx" ON "registrations"("eventId");