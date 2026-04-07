// module/legal/pages/PrivacyPolicyPage.tsx
import React from "react";
import { HeroText } from "@/components/ui/HeroText";
import PrivacyPolicyContent from "../components/PrivacyPolicyContent";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <div className="mt-42">
        <HeroText title="Privacy Policy" />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="mb-10 sm:mb-14 text-center text-3xl sm:text-4xl lg:text-5xl tracking-tight font-extrabold text-zinc-800 font-heading leading-tight">
          Your Privacy
          <br />
          Matters to Us
        </p>

        <PrivacyPolicyContent />
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
