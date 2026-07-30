"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { loginAction } from "@/actions/auth";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ light = false }: { light?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const res = await loginAction(values);
      if (res.success) {
        toast.success(res.message);
        router.push(res.redirectTo || "/admin");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  });

  const labelClass = light ? "text-foreground" : "text-white";
  const inputClass = light
    ? "border-border bg-background text-foreground"
    : "border-white/20 bg-white/10 text-white";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label className={labelClass}>Email</Label>
        <Input type="email" autoComplete="email" className={inputClass} {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-xs text-primary">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label className={labelClass}>Password</Label>
        <Input
          type="password"
          autoComplete="current-password"
          className={inputClass}
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-xs text-primary">{form.formState.errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}
