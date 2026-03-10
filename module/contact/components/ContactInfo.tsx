import { Phone, Mail } from "lucide-react";

const ContactInfo = () => {
  return (
    <div className="flex flex-col gap-8">
      {/* Phone */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-contact-icon">
            <Phone className="h-5 w-5 text-contact-icon-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground font-heading">
            Call us directly
          </h3>
        </div>
        <div className="ml-16 flex flex-col gap-0.5 text-muted-foreground text-[15px]">
          <span>(+088) 234-5110</span>
          <span>(+088) 456-3217</span>
        </div>
      </div>

      <div className="border-t border-contact-divider" />

      {/* Email */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-contact-icon">
            <Mail className="h-5 w-5 text-contact-icon-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground font-heading">
            Email us
          </h3>
        </div>
        <div className="ml-16 flex flex-col gap-0.5 text-muted-foreground text-[15px]">
          <span>example@gmail.com</span>
          <span>mthemeus@gmail.com</span>
        </div>
      </div>

      <div className="border-t border-contact-divider" />

      {/* Address */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-contact-icon">
            <Phone className="h-5 w-5 text-contact-icon-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground font-heading">
            Our office address
          </h3>
        </div>
        <div className="ml-16 text-muted-foreground text-[15px]">
          <span>4132 Thornridge City, New York.</span>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
