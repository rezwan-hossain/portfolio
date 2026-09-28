-- AlterTable
ALTER TABLE "events" ADD COLUMN     "confirmationSmsTemplate" TEXT;

-- CreateTable
CREATE TABLE "site_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("key")
);
