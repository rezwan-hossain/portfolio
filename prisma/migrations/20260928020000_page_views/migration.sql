-- CreateTable
CREATE TABLE "page_view_daily" (
    "day" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "eventId" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniques" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "page_view_daily_pkey" PRIMARY KEY ("day","path")
);

-- CreateTable
CREATE TABLE "page_visitors" (
    "day" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_visitors_pkey" PRIMARY KEY ("day","path","hash")
);

-- CreateIndex
CREATE INDEX "page_view_daily_eventId_day_idx" ON "page_view_daily"("eventId", "day");

-- CreateIndex
CREATE INDEX "page_visitors_day_idx" ON "page_visitors"("day");
