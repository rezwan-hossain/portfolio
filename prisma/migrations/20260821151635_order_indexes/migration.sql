-- CreateIndex
CREATE INDEX "orders_eventId_createdAt_idx" ON "orders"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "orders_eventId_status_idx" ON "orders"("eventId", "status");
