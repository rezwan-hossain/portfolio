// lib/faq-defaults.ts
//
// The original homepage FAQ. Seeded into the faqs table by its migration, and
// shown as a fallback only if the database can't be reached.

export const DEFAULT_FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I register for the marathon?",
    answer: "Click the register button on the homepage and fill out the registration form. Once completed, you'll receive a confirmation email with your race details.",
  },
  {
    question: "Is there an early bird discount?",
    answer: "Yes! Early bird pricing is available for a limited time. Register early to secure the best rate before slots fill up.",
  },
  {
    question: "Can beginners participate?",
    answer: "Absolutely! We offer 1K and 7.5K categories perfect for beginners as well as a half marathon for experienced runners.",
  },
  {
    question: "What should I bring on race day?",
    answer: "Bring your registration confirmation, proper running shoes, water bottle, and a positive attitude! Safety gear is recommended for long-distance runners.",
  },
  {
    question: "Is baggage storage available?",
    answer: "Yes, secure baggage drop-off will be provided near the start line.",
  },
  {
    question: "Is parking available at the venue?",
    answer: "Limited parking is available. Participants are encouraged to use public transportation or ride-sharing.",
  },
  {
    question: "Is there an age limit to participate?",
    answer: "NO.",
  },
  {
    question: "What happens if it rains?",
    answer: "The race will proceed in most weather conditions unless deemed unsafe by organizers.",
  },
];
