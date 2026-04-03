-- CreateEnum
CREATE TYPE "TeamCategory" AS ENUM ('ADMIN', 'ADVISOR', 'ORGANIZER');

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "bio" TEXT,
    "image" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "category" "TeamCategory" NOT NULL DEFAULT 'ADVISOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "linkedinUrl" TEXT,
    "twitterUrl" TEXT,
    "githubUrl" TEXT,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);
