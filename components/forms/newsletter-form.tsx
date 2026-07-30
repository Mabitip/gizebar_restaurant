"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeNewsletter } from "@/actions/newsletter";
import { newsletterSchema, type NewsletterInput } from "@/lib/validations";
import { cn } from "@/lib/utils";

export function NewsletterForm({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const form = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const res = await subscribeNewsletter(values);
      if (res.success) {
        setDone(true);
        form.reset();
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
      <Input
        type="email"
        placeholder="Your email address"
        aria-label="Email for newsletter"
        className={cn(
          variant === "dark" && "border-white/20 bg-white/10 text-white placeholder:text-white/40"
        )}
        {...form.register("email")}
      />
      <Button type="submit" disabled={pending || done} className="shrink-0">
        {done ? "Subscribed" : pending ? "Joining…" : "Subscribe"}
      </Button>
    </form>
  );
}
