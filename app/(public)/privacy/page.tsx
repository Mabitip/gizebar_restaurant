import type { Metadata } from "next";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${SITE.name}.`,
};

export default function PrivacyPage() {
  return (
    <div className="section-padding pt-28">
      <article className="prose prose-neutral mx-auto max-w-3xl px-4">
        <h1 className="font-heading text-4xl">Privacy Policy</h1>
        <p className="text-muted">Last updated: July 30, 2026</p>
        <p>
          {SITE.name} (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy
          explains how we collect and use information when you visit{" "}
          {SITE.domain}, make a reservation, subscribe to our newsletter, or contact us.
        </p>
        <h2 className="font-heading text-2xl">Information We Collect</h2>
        <p>
          We may collect your name, email address, phone number, reservation details,
          and messages you send through our forms. Technical data such as IP address and
          browser type may be processed for security and analytics.
        </p>
        <h2 className="font-heading text-2xl">How We Use Information</h2>
        <p>
          We use your information to confirm reservations, respond to inquiries, send
          newsletters you opted into, improve our services, and protect against fraud or abuse.
        </p>
        <h2 className="font-heading text-2xl">Sharing</h2>
        <p>
          We do not sell personal data. We may share information with trusted service
          providers (hosting, email, analytics) solely to operate the website and restaurant
          services, or when required by law.
        </p>
        <h2 className="font-heading text-2xl">Your Choices</h2>
        <p>
          You may unsubscribe from marketing emails at any time and request access or
          deletion of your personal data by contacting {SITE.email}.
        </p>
        <h2 className="font-heading text-2xl">Contact</h2>
        <p>
          Questions about this policy: {SITE.email} · {SITE.phone}
        </p>
      </article>
    </div>
  );
}
