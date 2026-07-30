import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <p className="text-sm uppercase tracking-[0.4em] text-primary">404</p>
      <h1 className="mt-4 font-heading text-5xl md:text-6xl">Page not found</h1>
      <p className="mt-4 max-w-md text-muted">
        The page you&apos;re looking for has left the table. Let&apos;s get you back to
        something delicious.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/menu">View Menu</Link>
        </Button>
      </div>
    </div>
  );
}
