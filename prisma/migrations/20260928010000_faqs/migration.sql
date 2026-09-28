-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "faqs_isActive_sortOrder_idx" ON "faqs"("isActive", "sortOrder");

-- Seed: the questions that were hard-coded on the homepage, so nothing
-- changes for visitors when this ships.
INSERT INTO "faqs" ("id", "question", "answer", "sortOrder", "isActive", "updatedAt") VALUES
  ('faq_seed_1', 'How do I register for the marathon?', 'Click the register button on the homepage and fill out the registration form. Once completed, you''ll receive a confirmation email with your race details.', 1, true, CURRENT_TIMESTAMP),
  ('faq_seed_2', 'Is there an early bird discount?', 'Yes! Early bird pricing is available for a limited time. Register early to secure the best rate before slots fill up.', 2, true, CURRENT_TIMESTAMP),
  ('faq_seed_3', 'Can beginners participate?', 'Absolutely! We offer 1K and 7.5K categories perfect for beginners as well as a half marathon for experienced runners.', 3, true, CURRENT_TIMESTAMP),
  ('faq_seed_4', 'What should I bring on race day?', 'Bring your registration confirmation, proper running shoes, water bottle, and a positive attitude! Safety gear is recommended for long-distance runners.', 4, true, CURRENT_TIMESTAMP),
  ('faq_seed_5', 'Is baggage storage available?', 'Yes, secure baggage drop-off will be provided near the start line.', 5, true, CURRENT_TIMESTAMP),
  ('faq_seed_6', 'Is parking available at the venue?', 'Limited parking is available. Participants are encouraged to use public transportation or ride-sharing.', 6, true, CURRENT_TIMESTAMP),
  ('faq_seed_7', 'Is there an age limit to participate?', 'NO.', 7, true, CURRENT_TIMESTAMP),
  ('faq_seed_8', 'What happens if it rains?', 'The race will proceed in most weather conditions unless deemed unsafe by organizers.', 8, true, CURRENT_TIMESTAMP);
