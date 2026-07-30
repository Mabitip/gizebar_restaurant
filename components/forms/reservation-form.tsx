"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createReservation } from "@/actions/reservations";
import { reservationSchema, type ReservationInput } from "@/lib/validations";

const times = [
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
];

export function ReservationForm() {
  const [pending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState(false);
  const form = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      guests: 2,
      date: "",
      time: "19:00",
      specialRequests: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const res = await createReservation(values);
      if (res.success) {
        setConfirmed(true);
        form.reset();
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  });

  if (confirmed) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <h3 className="font-heading text-3xl text-primary">Request Received</h3>
        <p className="mt-4 text-muted">
        Thank you for choosing Gize. Our reservations team will confirm your table
        shortly by phone or email.
      </p>
        <Button className="mt-6" type="button" onClick={() => setConfirmed(false)}>
          Make Another Reservation
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass-card space-y-5 rounded-2xl p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full Name" error={form.formState.errors.name?.message}>
          <Input {...form.register("name")} placeholder="Your name" />
        </Field>
        <Field label="Phone" error={form.formState.errors.phone?.message}>
          <Input {...form.register("phone")} placeholder="+251 ..." />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" {...form.register("email")} placeholder="you@email.com" />
        </Field>
        <Field label="Guests" error={form.formState.errors.guests?.message}>
          <Input
            type="number"
            min={1}
            max={50}
            {...form.register("guests", { valueAsNumber: true })}
          />
        </Field>
        <Field label="Date" error={form.formState.errors.date?.message}>
          <Input type="date" {...form.register("date")} />
        </Field>
        <Field label="Time" error={form.formState.errors.time?.message}>
          <select
            className="flex h-12 w-full rounded-xl border border-border bg-input-bg px-4 text-sm text-foreground"
            {...form.register("time")}
          >
            {times.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Special Requests" error={form.formState.errors.specialRequests?.message}>
        <Textarea
          {...form.register("specialRequests")}
          placeholder="Allergies, celebrations, seating preferences…"
        />
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Request Reservation"}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-primary">{error}</p>}
    </div>
  );
}
