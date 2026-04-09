import { ChevronDown } from "lucide-react";

// 1️⃣ Create the FAQ array
const faqs = [
  {
    question: "How do I register for the marathon?",
    answer:
      "Click the register button on the homepage and fill out the registration form. Once completed, you'll receive a confirmation email with your race details.",
  },
  {
    question: "Is there an early bird discount?",
    answer:
      "Yes! Early bird pricing is available for a limited time. Register early to secure the best rate before slots fill up.",
  },
  {
    question: "Can beginners participate?",
    answer:
      "Absolutely! We offer 1K and 7.5K categories perfect for beginners as well as a full marathon for experienced runners.",
  },
  {
    question: "What should I bring on race day?",
    answer:
      "Bring your registration confirmation, proper running shoes, water bottle, and a positive attitude! Safety gear is recommended for long-distance runners.",
  },
  {
    question: "Is baggage storage available?",
    answer:
      "Yes, secure baggage drop-off will be provided near the start line.",
  },
  {
    question: "Is parking available at the venue?",
    answer:
      "Limited parking is available. Participants are encouraged to use public transportation or ride-sharing.",
  },
  {
    question: "Is there an age limit to participate?",
    answer: "NO.",
  },
  {
    question: "What happens if it rains?",
    answer:
      "The race will proceed in most weather conditions unless deemed unsafe by organizers.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group border border-gray-300 rounded-xl p-6 transition-all duration-300 open:border-neon-lime open:bg-lime-50"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-display font-semibold text-left hover:no-underline ">
                  {faq.question}
                </span>
                <ChevronDown className="w-5 h-5 text-gray-500 transition-transform duration-300 group-open:rotate-180 group-open:text-neon-lime" />
              </summary>

              <div className="grid grid-rows-[0fr] transition-all duration-300 group-open:grid-rows-[1fr]">
                <div className="overflow-hidden">
                  <p className="pt-4 text-gray-600">{faq.answer}</p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
