import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | THC Plus",
  description:
    "Privacy Policy for THC Plus. Learn how we collect, use, and protect your personal information.",
};

const LAST_UPDATED = "February 21, 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#090F09]">
      {/* Header */}
      <div className="border-b border-emerald-900/30">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Link
            href="/"
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-emerald-950/50 hover:text-zinc-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold text-white">Privacy Policy</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-2xl border border-emerald-900/30 bg-[#111A11] p-6 sm:p-8">
          {/* Last Updated */}
          <p className="mb-6 text-xs text-zinc-500">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="space-y-8 text-sm leading-relaxed text-zinc-300">
            {/* Intro */}
            <p>
              THC Plus (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;) is committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, disclose, and
              safeguard your personal information when you use the THC Plus
              mobile application and website (the &quot;Platform&quot;) and visit
              our physical location at 5720 Hillcroft St, Houston, TX 77036.
              Please read this Privacy Policy carefully. By using our Platform,
              you consent to the practices described in this policy.
            </p>

            {/* Section 1 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                1. Information We Collect
              </h2>
              <p className="mb-3">
                We may collect the following types of personal information:
              </p>

              <h3 className="mb-2 text-sm font-semibold text-zinc-200">
                1.1 Information You Provide
              </h3>
              <ul className="ml-4 list-disc space-y-1.5 text-zinc-400">
                <li>
                  <strong className="text-zinc-300">Account Information:</strong>{" "}
                  Name, email address, phone number, and password when you create
                  an account.
                </li>
                <li>
                  <strong className="text-zinc-300">Order Information:</strong>{" "}
                  Products reserved, order history, pickup times, and order
                  preferences.
                </li>
                <li>
                  <strong className="text-zinc-300">Communication Data:</strong>{" "}
                  Messages you send us through customer support, chat, or
                  feedback forms.
                </li>
                <li>
                  <strong className="text-zinc-300">Age Verification:</strong>{" "}
                  Confirmation that you are 21 years of age or older.
                </li>
              </ul>

              <h3 className="mb-2 mt-4 text-sm font-semibold text-zinc-200">
                1.2 Information Collected Automatically
              </h3>
              <ul className="ml-4 list-disc space-y-1.5 text-zinc-400">
                <li>
                  <strong className="text-zinc-300">Device Information:</strong>{" "}
                  Device type, operating system, browser type, and unique device
                  identifiers.
                </li>
                <li>
                  <strong className="text-zinc-300">Usage Data:</strong> Pages
                  visited, features used, browsing patterns, and timestamps.
                </li>
                <li>
                  <strong className="text-zinc-300">
                    Cookies and Similar Technologies:
                  </strong>{" "}
                  Session cookies, preference cookies, and local storage data
                  (such as age verification and onboarding status).
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                2. How We Use Your Information
              </h2>
              <p className="mb-3">
                We use the information we collect for the following purposes:
              </p>
              <ul className="ml-4 list-disc space-y-1.5 text-zinc-400">
                <li>
                  <strong className="text-zinc-300">Order Processing:</strong>{" "}
                  To process and manage your will-call reservations and
                  facilitate in-store pickup.
                </li>
                <li>
                  <strong className="text-zinc-300">
                    Loyalty Rewards Program:
                  </strong>{" "}
                  To track and manage your loyalty points, tier status, and
                  reward redemptions.
                </li>
                <li>
                  <strong className="text-zinc-300">Communications:</strong> To
                  send you order confirmations, status updates, pickup
                  reminders, and important service announcements.
                </li>
                <li>
                  <strong className="text-zinc-300">
                    Platform Improvement:
                  </strong>{" "}
                  To analyze usage patterns and improve the functionality, user
                  experience, and content of the Platform.
                </li>
                <li>
                  <strong className="text-zinc-300">Customer Support:</strong>{" "}
                  To respond to your inquiries, requests, and feedback.
                </li>
                <li>
                  <strong className="text-zinc-300">
                    Security &amp; Compliance:
                  </strong>{" "}
                  To detect and prevent fraud, enforce our Terms of Service, and
                  comply with applicable laws.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                3. SMS and Push Notifications
              </h2>
              <p>
                With your explicit consent, we may send you SMS text messages
                and/or push notifications regarding:
              </p>
              <ul className="ml-4 mt-2 list-disc space-y-1.5 text-zinc-400">
                <li>Order confirmation and status updates</li>
                <li>Pickup reminders when your order is ready</li>
                <li>Loyalty rewards and promotional offers</li>
                <li>Important account-related notices</li>
              </ul>
              <p className="mt-3">
                You may opt out of SMS notifications at any time by replying
                &quot;STOP&quot; to any message or adjusting your notification
                preferences in your account settings. You may disable push
                notifications through your device settings. Standard messaging
                and data rates may apply. Message frequency varies based on your
                order activity.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                4. No Sale of Personal Data
              </h2>
              <p>
                <strong className="text-emerald-400">
                  THC Plus does not sell, rent, or trade your personal
                  information to third parties.
                </strong>{" "}
                We do not share your data for third-party marketing purposes. We
                value your trust and are committed to keeping your information
                private and secure.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                5. Information Sharing
              </h2>
              <p className="mb-3">
                We may share your information only in the following limited
                circumstances:
              </p>
              <ul className="ml-4 list-disc space-y-1.5 text-zinc-400">
                <li>
                  <strong className="text-zinc-300">Service Providers:</strong>{" "}
                  With trusted third-party service providers who assist us in
                  operating the Platform (e.g., hosting, analytics, SMS
                  delivery), subject to confidentiality agreements.
                </li>
                <li>
                  <strong className="text-zinc-300">Legal Requirements:</strong>{" "}
                  When required by law, court order, or governmental authority,
                  or when we believe in good faith that disclosure is necessary
                  to protect our rights, your safety, or the safety of others.
                </li>
                <li>
                  <strong className="text-zinc-300">Business Transfers:</strong>{" "}
                  In connection with a merger, acquisition, or sale of all or a
                  portion of our assets, in which case your information may be
                  transferred to the acquiring entity.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                6. Data Retention
              </h2>
              <p>
                We retain your personal information for as long as your account
                is active or as needed to provide you with our services. We may
                also retain certain information as required to comply with legal
                obligations, resolve disputes, and enforce our agreements.
                Specifically:
              </p>
              <ul className="ml-4 mt-2 list-disc space-y-1.5 text-zinc-400">
                <li>
                  <strong className="text-zinc-300">Account Data:</strong>{" "}
                  Retained for the duration of your account and for up to 12
                  months after account deletion.
                </li>
                <li>
                  <strong className="text-zinc-300">Order History:</strong>{" "}
                  Retained for up to 24 months for loyalty program tracking and
                  operational purposes.
                </li>
                <li>
                  <strong className="text-zinc-300">
                    Communication Records:
                  </strong>{" "}
                  Retained for up to 12 months for customer service quality
                  assurance.
                </li>
              </ul>
              <p className="mt-3">
                You may request deletion of your personal data at any time by
                contacting us (see Section 9).
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                7. Cookies and Local Storage
              </h2>
              <p>We use cookies and local storage technologies to:</p>
              <ul className="ml-4 mt-2 list-disc space-y-1.5 text-zinc-400">
                <li>
                  Remember your age verification status so you do not need to
                  re-verify on each visit.
                </li>
                <li>
                  Store your onboarding completion status for a seamless
                  experience.
                </li>
                <li>
                  Maintain your session and authentication state while logged
                  in.
                </li>
                <li>
                  Analyze Platform usage to improve functionality and
                  performance.
                </li>
              </ul>
              <p className="mt-3">
                You may manage cookie preferences through your browser settings.
                Disabling certain cookies may affect the functionality of the
                Platform. Local storage items used by THC Plus include age
                verification and onboarding preference flags.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                8. Data Security
              </h2>
              <p>
                We implement reasonable administrative, technical, and physical
                security measures to protect your personal information against
                unauthorized access, alteration, disclosure, or destruction.
                However, no method of transmission over the Internet or method
                of electronic storage is 100% secure. While we strive to protect
                your data, we cannot guarantee its absolute security.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                9. Your Rights and Choices
              </h2>
              <p className="mb-3">
                Depending on your jurisdiction, you may have the following rights
                regarding your personal information:
              </p>
              <ul className="ml-4 list-disc space-y-1.5 text-zinc-400">
                <li>
                  <strong className="text-zinc-300">Access:</strong> Request a
                  copy of the personal data we hold about you.
                </li>
                <li>
                  <strong className="text-zinc-300">Correction:</strong> Request
                  correction of any inaccurate or incomplete data.
                </li>
                <li>
                  <strong className="text-zinc-300">Deletion:</strong> Request
                  deletion of your personal data, subject to applicable legal
                  retention requirements.
                </li>
                <li>
                  <strong className="text-zinc-300">Opt-Out:</strong> Opt out of
                  marketing communications and SMS notifications at any time.
                </li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, please contact us using the
                information in Section 11.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                10. Changes to This Privacy Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time to reflect
                changes in our practices or applicable laws. We will notify you
                of any material changes by posting the updated policy on the
                Platform with a revised &quot;Last updated&quot; date. Your
                continued use of the Platform after any changes constitutes your
                acceptance of the updated Privacy Policy. We encourage you to
                review this policy periodically.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                11. Contact Us
              </h2>
              <p>
                If you have any questions, concerns, or requests regarding this
                Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-3 rounded-xl border border-emerald-900/20 bg-[#090F09] p-4 text-zinc-400">
                <p className="font-semibold text-zinc-200">
                  THC Plus - Privacy Inquiries
                </p>
                <p>5720 Hillcroft St, Houston, TX 77036</p>
                <p>Phone: (832) 831-6882</p>
              </div>
              <p className="mt-3">
                We will respond to all legitimate privacy requests within 30
                days of receipt.
              </p>
            </section>
          </div>
        </div>

        {/* Bottom spacer for mobile nav */}
        <div className="h-8" />
      </div>
    </div>
  );
}
