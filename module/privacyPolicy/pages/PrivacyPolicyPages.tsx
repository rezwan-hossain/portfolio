// components/PrivacyPolicy.tsx

const sections = [
  {
    title: "1. Information We Collect",
    content:
      "We may collect personal information such as your name, email address, and usage data.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "We use your data to provide services, improve experience, and communicate updates.",
  },
  {
    title: "3. Cookies",
    content:
      "We use cookies to enhance user experience and analyze traffic.",
  },
  {
    title: "4. Data Security",
    content:
      "We implement reasonable security measures to protect your data.",
  },
  {
    title: "5. Third-Party Services",
    content:
      "We may use third-party services for analytics and improvements.",
  },
  {
    title: "6. Your Rights",
    content:
      "You can request access, update, or deletion of your personal data.",
  },
  {
    title: "7. Changes to This Policy",
    content:
      "We may update this policy periodically. Changes will appear here.",
  },
  {
    title: "8. Contact Us",
    content:
      "Contact us at support@example.com for any questions.",
  },
];

export default function PrivacyPolicyPages() {
  return (
    <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-lg">
      <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>

      <p className="mb-4 text-sm text-gray-500">
        Last updated: March 24, 2026
      </p>

      <div className="space-y-6 text-gray-700">
        {sections.map((section, index) => (
          <div key={index}>
            <h2 className="text-xl font-semibold text-gray-900">
              {section.title}
            </h2>
            <p className="mt-2">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

