"use client";

import Image from "next/image";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitEventBooking } from "@/actions/contact";
import { eventBookingSchema } from "@/lib/validations";

type EventItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  image: string | null;
  category: string;
  startDate: Date;
  price: string | null;
  capacity: number | null;
};

export function EventsClient({ events }: { events: EventItem[] }) {
  const [selected, setSelected] = useState(events[0]?.id || "");

  return (
    <div className="grid gap-10 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-3">
        {events.map((event) => (
          <article
            key={event.id}
            className={`glass-card overflow-hidden rounded-2xl transition ${
              selected === event.id ? "ring-2 ring-primary" : ""
            }`}
          >
            <button
              type="button"
              className="w-full text-left"
              onClick={() => setSelected(event.id)}
            >
              <div className="relative aspect-[21/9]">
                {event.image && (
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="space-y-2 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-primary">
                  {format(new Date(event.startDate), "MMMM d, yyyy")} · {event.category}
                </p>
                <h2 className="font-heading text-2xl">{event.title}</h2>
                <p className="text-sm text-muted">{event.description}</p>
                {event.price && (
                  <p className="text-sm font-medium">{event.price}</p>
                )}
              </div>
            </button>
          </article>
        ))}
      </div>
      <div className="lg:col-span-2">
        <div className="sticky top-28">
          <h3 className="font-heading text-2xl">Book an Event</h3>
          <p className="mt-2 text-sm text-muted">
            Tell us about your celebration and our events team will follow up.
          </p>
          <div className="mt-6">
            <EventBookingForm eventId={selected || "general"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function EventBookingForm({ eventId }: { eventId: string }) {
  const [pending, startTransition] = useTransition();
  type FormValues = z.infer<typeof eventBookingSchema>;
  const form = useForm<FormValues>({
    resolver: zodResolver(eventBookingSchema),
    values: {
      eventId,
      name: "",
      email: "",
      phone: "",
      guests: 10,
      message: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const res = await submitEventBooking(values);
      if (res.success) {
        toast.success(res.message);
        form.reset({ ...values, name: "", email: "", phone: "", message: "" });
      } else toast.error(res.message);
    });
  });

  return (
    <form onSubmit={onSubmit} className="glass-card space-y-4 rounded-2xl p-6">
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
        <Label>Guests</Label>
        <Input type="number" min={1} {...form.register("guests", { valueAsNumber: true })} />
      </div>
      <div className="space-y-2">
        <Label>Message</Label>
        <Textarea {...form.register("message")} />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Submit Inquiry"}
      </Button>
    </form>
  );
}
