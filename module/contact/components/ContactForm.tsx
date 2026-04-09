"use client";
import { useState } from "react";

type FormType = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const ContactForm = () => {
  const [form, setForm] = useState<FormType>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<FormType>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // remove error while typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors: Partial<FormType> = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.subject.trim()) newErrors.subject = "Subject is required";
    if (!form.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    console.log("Form submitted:", form);
  };

  const inputStyle = (field: keyof FormType) =>
    `rounded-xl bg-neutral-200 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring ${
      errors[field] ? "border border-red-500" : ""
    }`;

  return (
    <div className="rounded-2xl bg-card p-8 lg:p-10 bg-neutral-50 border border-lime-100">
      <p className="mb-6 text-muted-foreground text-[15px]">
        Fill in the form below and we will get back to you as soon as possible.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">
              Your Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              className={inputStyle("name")}
            />
            {errors.name && (
              <span className="text-red-500 text-xs">{errors.name}</span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              placeholder="example@gmail.com"
              value={form.email}
              onChange={handleChange}
              className={inputStyle("email")}
            />
            {errors.email && (
              <span className="text-red-500 text-xs">{errors.email}</span>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="+880-xxx-xxx"
              value={form.phone}
              onChange={handleChange}
              className={inputStyle("phone")}
            />
            {errors.phone && (
              <span className="text-red-500 text-xs">{errors.phone}</span>
            )}
          </div>

          {/* Subject */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              placeholder="Business"
              value={form.subject}
              onChange={handleChange}
              className={inputStyle("subject")}
            />
            {errors.subject && (
              <span className="text-red-500 text-xs">{errors.subject}</span>
            )}
          </div>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">
            Message *
          </label>
          <textarea
            name="message"
            placeholder="Write your message here..."
            rows={5}
            value={form.message}
            onChange={handleChange}
            className={`resize-none ${inputStyle("message")}`}
          />
          {errors.message && (
            <span className="text-red-500 text-xs">{errors.message}</span>
          )}
        </div>

        <div>
          <button
            type="submit"
            className="cursor-pointer rounded-full bg-neon-lime px-8 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
