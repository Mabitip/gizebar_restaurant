"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { saveSetting } from "@/actions/admin";

type SiteSettings = {
  name: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
};

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [pending, startTransition] = useTransition();
  const [site, setSite] = useState<SiteSettings>(initial);

  const save = (key: string) => {
    startTransition(async () => {
      const res = await saveSetting(key, site);
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
        <h3 className="font-heading text-xl">Site Settings</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Restaurant Name</Label>
            <Input value={site.name} onChange={(e) => setSite({ ...site, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={site.phone} onChange={(e) => setSite({ ...site, phone: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={site.email} onChange={(e) => setSite({ ...site, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={site.address}
              onChange={(e) => setSite({ ...site, address: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={site.description}
              onChange={(e) => setSite({ ...site, description: e.target.value })}
            />
          </div>
        </div>
        <Button className="mt-4" disabled={pending} onClick={() => save("site")}>
          Save Site Settings
        </Button>
      </section>

      <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
        <h3 className="font-heading text-xl">SEO Settings</h3>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Default Title</Label>
            <Input
              value={site.seoTitle}
              onChange={(e) => setSite({ ...site, seoTitle: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Meta Description</Label>
            <Textarea
              value={site.seoDescription}
              onChange={(e) => setSite({ ...site, seoDescription: e.target.value })}
            />
          </div>
        </div>
        <Button className="mt-4" disabled={pending} onClick={() => save("seo")}>
          Save SEO Settings
        </Button>
      </section>
    </div>
  );
}
