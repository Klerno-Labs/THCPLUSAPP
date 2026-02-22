import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | THC Plus",
  description:
    "Terms of Service for THC Plus will-call ordering and pickup in Houston, TX.",
};

const LAST_UPDATED = "February 21, 2026";

export default function TermsPage() {
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
          <h1 className="text-lg font-bold text-white">Terms of Service</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-2xl border border-emerald-900/30 bg-[#111A11] p-6 sm:p-8">
          {/* Last Updated */}
          <p className="mb-6 text-xs text-zinc-500">
            Last updated: {LAST_UPDATED}
          </p>

          {/* Intro */}
          <div className="space-y-8 text-sm leading-relaxed text-zinc-300">
            <p>
              Welcome to THC Plus (&quot;Company,&quot; &quot;we,&quot;
              &quot;us,&quot; or &quot;our&quot;). These Terms of Service
              (&quot;Terms&quot;) govern your use of the THC Plus mobile
              application and website (collectively, the &quot;Platform&quot;)
              located at 5720 Hillcroft St, Houston, TX 77036. By accessing or
              using our Platform, you agree to be bound by these Terms. If you
              do not agree to these Terms, please do not use the Platform.
            </p>

            {/* Section 1 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                1. Age Requirement
              </h2>
              <p>
                You must be at least 21 years of age to access and use the THC
                Plus Platform. By using our Platform, you represent and warrant
                that you are at least 21 years old. We reserve the right to
                request valid government-issued photo identification at any time,
                including at the time of pickup. If you cannot provide
                satisfactory proof of age, your order will be cancelled and you
                will be denied service.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                2. Will-Call Ordering &amp; Pickup
              </h2>
              <ul className="ml-4 list-disc space-y-2 text-zinc-400">
                <li>
                  THC Plus operates exclusively as a <strong className="text-zinc-200">will-call pickup</strong>{" "}
                  service. All orders placed through the Platform are reservations
                  only and do not constitute a completed purchase until the items
                  are picked up in-store.
                </li>
                <li>
                  <strong className="text-zinc-200">No online payment</strong>{" "}
                  is processed. All payments are made in-store at the time of
                  pickup.
                </li>
                <li>
                  <strong className="text-zinc-200">No delivery service</strong>{" "}
                  is offered. You must visit our Houston location to collect your
                  order.
                </li>
                <li>
                  We accept cash, debit, and credit card payments at our
                  physical location only.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                3. Order Hold Period
              </h2>
              <p>
                Reserved items will be held for a maximum of{" "}
                <strong className="text-zinc-200">24 hours</strong> from the time
                your order is confirmed. After the 24-hour hold period, unpicked
                orders will be automatically cancelled and the reserved items
                will be returned to available inventory. THC Plus is not
                responsible for items that are no longer available after an order
                expires. We may, at our sole discretion, extend the hold period
                on a case-by-case basis.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                4. Product Availability
              </h2>
              <p>
                All products displayed on the Platform are subject to
                availability. While we make reasonable efforts to keep our
                inventory accurate and up to date, product availability may
                change at any time without notice. In the event that a reserved
                item is no longer available when you arrive for pickup, we will
                offer a suitable alternative or cancel the affected item from
                your reservation at no penalty.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                5. Right to Refuse Service
              </h2>
              <p>
                THC Plus reserves the right to refuse service to any individual
                at our sole discretion for any reason, including but not limited
                to:
              </p>
              <ul className="ml-4 mt-2 list-disc space-y-1.5 text-zinc-400">
                <li>Failure to provide valid proof of age (21+)</li>
                <li>Suspected impairment at time of pickup</li>
                <li>Abusive or threatening behavior toward staff</li>
                <li>Suspected intent to resell or distribute products</li>
                <li>Violation of any of these Terms</li>
                <li>Any behavior deemed inappropriate or unsafe</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                6. Loyalty Rewards Program
              </h2>
              <ul className="ml-4 list-disc space-y-2 text-zinc-400">
                <li>
                  Loyalty points are earned based on completed in-store pickups
                  only. Points are awarded after the order has been successfully
                  picked up.
                </li>
                <li>
                  Points have no cash value and cannot be transferred, sold, or
                  exchanged for cash.
                </li>
                <li>
                  Redeemed rewards must be picked up within 7 days or they will
                  expire.
                </li>
                <li>
                  THC Plus reserves the right to modify, suspend, or terminate
                  the Loyalty Rewards Program at any time, with or without
                  notice. Accumulated points may be adjusted or forfeited in
                  cases of suspected fraud or abuse.
                </li>
                <li>
                  Program tiers (Seedling, Grower, Cultivator, Master Grower)
                  are based on cumulative points earned. Tier status and
                  associated benefits may be updated periodically.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                7. Account Registration
              </h2>
              <p>
                To place orders and participate in the Loyalty Rewards Program,
                you may be required to create an account. You are responsible for
                maintaining the confidentiality of your account credentials and
                for all activity that occurs under your account. You agree to
                provide accurate, current, and complete information during
                registration and to update such information as necessary. THC
                Plus reserves the right to suspend or terminate accounts that
                contain inaccurate information or are used in violation of these
                Terms.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                8. Intellectual Property
              </h2>
              <p>
                All content on the Platform, including but not limited to text,
                graphics, logos, images, software, and trademarks, is the
                property of THC Plus or its licensors and is protected by
                applicable intellectual property laws. You may not reproduce,
                distribute, modify, or create derivative works from any content
                on the Platform without our prior written consent.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                9. Limitation of Liability
              </h2>
              <p>
                To the fullest extent permitted by applicable law, THC Plus, its
                owners, officers, directors, employees, and agents shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages, including but not limited to loss of profits,
                data, use, or goodwill, arising out of or in connection with your
                use of the Platform or any products obtained through the
                Platform.
              </p>
              <p className="mt-3">
                The Platform is provided on an &quot;as is&quot; and &quot;as
                available&quot; basis without warranties of any kind, whether
                express or implied, including but not limited to implied
                warranties of merchantability, fitness for a particular purpose,
                or non-infringement.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                10. Indemnification
              </h2>
              <p>
                You agree to indemnify, defend, and hold harmless THC Plus, its
                owners, officers, employees, and agents from and against any
                claims, liabilities, damages, losses, and expenses (including
                reasonable attorneys&apos; fees) arising out of or in any way
                connected with your use of the Platform, your violation of these
                Terms, or your violation of any applicable law.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                11. Governing Law
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with
                the laws of the State of Texas, without regard to its conflict of
                law provisions. Any disputes arising under these Terms shall be
                resolved exclusively in the state or federal courts located in
                Harris County, Texas.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                12. Changes to These Terms
              </h2>
              <p>
                We reserve the right to update or modify these Terms at any time.
                Changes will be effective immediately upon posting the revised
                Terms on the Platform. Your continued use of the Platform after
                any such changes constitutes your acceptance of the new Terms. We
                encourage you to review these Terms periodically.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="mb-3 text-base font-bold text-white">
                13. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms of Service, please
                contact us:
              </p>
              <div className="mt-3 rounded-xl border border-emerald-900/20 bg-[#090F09] p-4 text-zinc-400">
                <p className="font-semibold text-zinc-200">THC Plus</p>
                <p>5720 Hillcroft St, Houston, TX 77036</p>
                <p>Phone: (832) 831-6882</p>
              </div>
            </section>
          </div>
        </div>

        {/* Bottom spacer for mobile nav */}
        <div className="h-8" />
      </div>
    </div>
  );
}
