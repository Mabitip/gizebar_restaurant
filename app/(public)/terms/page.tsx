import type { Metadata } from "next";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of service for ${SITE.name}.`,
};

export default function TermsPage() {
  return (
    <div className="section-padding pt-28">
      <article className="prose prose-neutral mx-auto max-w-3xl px-4">
        <h1 className="font-heading text-4xl">Terms of Service</h1>
        <p className="text-muted">Last updated: July 30, 2026</p>
        <p>
          By using {SITE.domain} and dining at {SITE.name}, you agree to these terms.
        </p>
        <h2 className="font-heading text-2xl">Reservations</h2>
        <p>
          Online reservation requests are subject to availability and confirmation by our
          team. We may require a deposit for large parties or special events. Please notify
          us promptly of cancellations.
        </p>
        <h2 className="font-heading text-2xl">Menu & Pricing</h2>
        <p>
          Menu items, descriptions, and prices may change without notice. Images are
          illustrative. Alcohol service complies with Ethiopian law; valid ID may be required.
        </p>
        <h2 className="font-heading text-2xl">Conduct</h2>
        <p>
          Guests are expected to treat staff and other patrons with respect. We reserve
          the right to refuse service where necessary to maintain a safe, welcoming environment.
        </p>
        <h2 className="font-heading text-2xl">Website Use</h2>
        <p>
          Content on this website is owned by {SITE.name} or its licensors. You may not
          scrape, misuse forms, or attempt unauthorized access to administrative systems.
        </p>
        <h2 className="font-heading text-2xl">Contact</h2>
        <p>
          {SITE.email} · {SITE.phone} · {SITE.address}
        </p>
      </article>
    </div>
  );
}
