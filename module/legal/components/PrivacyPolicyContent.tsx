// module/legal/components/PrivacyPolicyContent.tsx
import {
  Shield,
  Database,
  Cookie,
  Lock,
  Share2,
  UserCheck,
  RefreshCw,
  Mail,
} from "lucide-react";

const sections = [
  {
    icon: Database,
    title: "1. Information We Collect",
    content: `
      We collect information to provide better services to our marathon participants. The types of information we collect include:
      
      • Personal Information: Name, email address, phone number, date of birth, gender, and emergency contact details provided during registration.
      • Health Information: Blood group, medical conditions, and physical fitness information relevant to marathon participation.
      • Payment Information: Transaction details processed through our secure payment gateways (ShurjoPay, bKash, Nagad).
      • Event Data: Race times, participation history, and performance statistics.
      • Usage Data: Information about how you interact with our website, including IP address, browser type, and pages visited.
    `,
  },
  {
    icon: Shield,
    title: "2. How We Use Your Information",
    content: `
      We use the collected information for the following purposes:
      
      • Event Management: Processing registrations, assigning BIB numbers, and managing race logistics.
      • Communication: Sending event updates, race instructions, and important announcements via email or SMS.
      • Safety & Medical: Providing medical support during events and contacting emergency contacts if necessary.
      • Timing & Results: Recording and publishing race times and results.
      • Improvement: Analyzing usage patterns to improve our website and event experience.
      • Marketing: Sending information about future events and promotions (with your consent).
    `,
  },
  {
    icon: Cookie,
    title: "3. Cookies & Tracking",
    content: `
      We use cookies and similar tracking technologies to enhance your experience:
      
      • Essential Cookies: Required for website functionality, authentication, and security.
      • Analytics Cookies: Help us understand how visitors interact with our website using services like Google Analytics.
      • Preference Cookies: Remember your settings and preferences for future visits.
      
      You can control cookie settings through your browser. However, disabling certain cookies may affect website functionality.
    `,
  },
  {
    icon: Lock,
    title: "4. Data Security",
    content: `
      We take the security of your data seriously and implement appropriate measures:
      
      • Encryption: All sensitive data is encrypted during transmission using SSL/TLS protocols.
      • Secure Storage: Personal information is stored on secure servers with restricted access.
      • Payment Security: We do not store complete payment card details. All transactions are processed through PCI-compliant payment gateways.
      • Access Control: Only authorized personnel have access to personal data on a need-to-know basis.
      • Regular Audits: We conduct periodic security assessments to identify and address vulnerabilities.
    `,
  },
  {
    icon: Share2,
    title: "5. Third-Party Services",
    content: `
      We may share your information with trusted third parties for event operations:
      
      • Payment Processors: ShurjoPay, bKash, and Nagad for secure payment processing.
      • Timing Companies: Official timing partners for accurate race time recording.
      • Medical Services: Emergency medical teams for participant safety during events.
      • Analytics Providers: Google Analytics for website performance analysis.
      • Email Services: For sending event communications and updates.
      
      We ensure all third parties adhere to appropriate data protection standards and only use your data for specified purposes.
    `,
  },
  {
    icon: UserCheck,
    title: "6. Your Rights",
    content: `
      You have the following rights regarding your personal data:
      
      • Access: Request a copy of the personal information we hold about you.
      • Correction: Request corrections to any inaccurate or incomplete information.
      • Deletion: Request deletion of your personal data, subject to legal retention requirements.
      • Opt-Out: Unsubscribe from marketing communications at any time.
      • Data Portability: Request your data in a portable format.
      • Withdraw Consent: Withdraw previously given consent for data processing.
      
      To exercise these rights, please contact us using the information provided below.
    `,
  },
  {
    icon: RefreshCw,
    title: "7. Changes to This Policy",
    content: `
      We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements:
      
      • Notification: Significant changes will be communicated via email or website announcement.
      • Effective Date: The "Last Updated" date at the top indicates when the policy was last revised.
      • Continued Use: Your continued use of our services after changes constitutes acceptance of the updated policy.
      
      We encourage you to review this policy regularly to stay informed about how we protect your information.
    `,
  },
  {
    icon: Mail,
    title: "8. Contact Us",
    content: `
      If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
      
      Email: privacy@bengalmarathon.com
      Phone: +880 1XXX-XXXXXX
      Address: Dhaka, Bangladesh
      
      We aim to respond to all inquiries within 48 hours during business days.
    `,
  },
];

export default function PrivacyPolicyContent() {
  return (
    <div className="rounded-xl sm:rounded-2xl bg-white p-4 sm:p-6 md:p-8 shadow-lg border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Privacy Policy
        </h1>
        <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full w-fit">
          Bengal Marathon
        </span>
      </div>

      <p className="mb-6 text-xs sm:text-sm text-gray-500">
        Last updated: January 15, 2025
      </p>

      <div className="mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-800">
          <strong>Our Commitment:</strong> At Bengal Marathon, we are committed
          to protecting your privacy and ensuring the security of your personal
          information. This Privacy Policy explains how we collect, use, store,
          and protect your data when you use our services and participate in our
          events.
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8 text-gray-700">
        {sections.map((section, index) => {
          const IconComponent = section.icon;
          return (
            <div
              key={index}
              className="scroll-mt-20 border-b border-gray-100 pb-6 sm:pb-8 last:border-b-0"
              id={`section-${index + 1}`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-neon-lime/20 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                    {section.title}
                  </h2>
                  <div className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-200">
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
              Data Retention
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              We retain your personal data for as long as necessary to fulfill
              the purposes outlined in this policy, unless a longer retention
              period is required by law.
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
              Children's Privacy
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Our services are not directed to children under 13. We do not
              knowingly collect personal information from children without
              parental consent.
            </p>
          </div>
        </div> */}
      </div>

      <div className="mt-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-xs sm:text-sm text-green-800">
          <strong>Your Consent:</strong> By using our website and registering
          for our marathon events, you consent to the collection and use of your
          information as described in this Privacy Policy. If you do not agree
          with this policy, please do not use our services.
        </p>
      </div>
    </div>
  );
}
