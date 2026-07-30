"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitContact } from "@/actions/contact";
import { contactSchema, type ContactInput } from "@/lib/validations";

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const res = await submitContact(values);
      if (res.success) {
        toast.success(res.message);
        form.reset();
      } else toast.error(res.message);
    });
  });

  return (
    <form onSubmit={onSubmit} className="glass-card space-y-5 rounded-2xl p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input {...form.register("name")} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" {...form.register("email")} />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input {...form.register("phone")} />
        </div>
        <div className="space-y-2">
          <Label>Subject</Label>
          <Input {...form.register("subject")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Message</Label>
        <Textarea {...form.register("message")} />
      </div>
      <Button type="submit" disabled={pending} className="w-full" size="lg">
        {pending ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
