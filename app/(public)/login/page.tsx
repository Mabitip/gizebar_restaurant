import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Staff Login",
  description: `Sign in to the ${SITE.name} staff dashboard`,
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center px-4 py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-xl">
        <p className="text-center text-xs uppercase tracking-[0.35em] text-primary">Staff Access</p>
        <h1 className="mt-3 text-center font-heading text-3xl text-foreground">{SITE.shortName} Login</h1>
        <p className="mt-2 text-center text-sm text-muted">
          Super Admin, Reservation Manager, and Content Editor sign in here.
        </p>
        <div className="mt-8">
          <LoginForm light />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/" className="text-primary hover:underline">
            Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
