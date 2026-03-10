import React from "react";
import ContactInfo from "../components/ContactInfo";
import ContactForm from "../components/ContactForm";
import { HeroText } from "@/components/ui/HeroText";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <div className="mt-16 ">
        <HeroText title="Contact" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="mb-14 text-center text-4xl sm:text-5xl tracking-tight lg:text-6xl font-extrabold text-zinc-800 font-heading leading-tight">
          Reach out and
          <br />
          connect with us
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-16 items-start">
          <ContactInfo />
          <ContactForm />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
