-- CreateTable
CREATE TABLE "hero_sections" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Run Beyond',
    "desktopImage" TEXT NOT NULL,
    "mobileImage" TEXT,
    "slug" TEXT,
    "eventDate" TIMESTAMP(3),
    "showCountdown" BOOLEAN NOT NULL DEFAULT true,
    "showSlugButton" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_sections_pkey" PRIMARY KEY ("id")
);
