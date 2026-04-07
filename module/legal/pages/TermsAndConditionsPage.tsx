// module/legal/pages/TermsAndConditionsPage.tsx
import React from "react";
import { HeroText } from "@/components/ui/HeroText";
import TermsAndConditionsContent from "../components/TermsAndConditionsContent";

const TermsAndConditionsPage = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <div className="mt-42">
        <HeroText title="Terms & Conditions" />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="mb-10 sm:mb-14 text-center text-3xl sm:text-4xl lg:text-5xl tracking-tight font-extrabold text-zinc-800 font-heading leading-tight">
          Marathon Event
          <br />
          Terms & Conditions
        </p>

        <TermsAndConditionsContent />
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;
