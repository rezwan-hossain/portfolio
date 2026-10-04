-- CreateTable
CREATE TABLE "share_click_daily" (
    "day" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "sharers" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "share_click_daily_pkey" PRIMARY KEY ("day","eventId","place","channel")
);

-- CreateIndex
CREATE INDEX "share_click_daily_eventId_day_idx" ON "share_click_daily"("eventId", "day");
