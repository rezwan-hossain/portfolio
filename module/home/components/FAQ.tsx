import { ChevronDown } from "lucide-react";
import { getPublicFaqs } from "@/app/actions/faq";

// Questions come from the database (edited under Manage Homepage → FAQ).
// getPublicFaqs is cached and refreshed the moment an admin saves.
export default async function FAQ() {
  const faqs = await getPublicFaqs();
  if (faqs.length === 0) return null; // every question hidden → no section

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
                  <p className="pt-4 text-gray-600 whitespace-pre-line">{faq.answer}</p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
