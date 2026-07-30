"use client";

import { MessageCircle, Phone } from "lucide-react";
import { phoneTel, whatsappUrl } from "@/lib/utils";

export function FloatingActions() {
  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-3 md:bottom-6 md:right-6">
      <a
        href={phoneTel()}
        aria-label="Call Gize Bar & Restaurant"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-xl shadow-foreground/20 transition hover:scale-110 hover:bg-primary hover:text-white md:h-14 md:w-14"
      >
        <Phone className="h-5 w-5" />
      </a>
      <a
        href={whatsappUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Gize Bar & Restaurant"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/30 transition hover:scale-110 md:h-14 md:w-14"
      >
        <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
      </a>
    </div>
  );
}
