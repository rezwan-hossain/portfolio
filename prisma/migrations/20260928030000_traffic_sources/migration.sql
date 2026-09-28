-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "trafficCampaign" TEXT,
ADD COLUMN     "trafficSource" TEXT;

-- CreateTable
CREATE TABLE "traffic_source_daily" (
    "day" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "campaign" TEXT NOT NULL DEFAULT '',
    "visits" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "traffic_source_daily_pkey" PRIMARY KEY ("day","source","campaign")
);
