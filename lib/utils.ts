import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = "ETB") {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function whatsappUrl(message?: string) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "251968626262";
  const text = encodeURIComponent(
    message ||
      "Hello Gize Bar & Restaurant! I would like to place an order."
  );
  return `https://wa.me/${number}?text=${text}`;
}

export function orderPageUrl(qrToken?: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || SITE.domain;
  return qrToken ? `${base}/order?t=${qrToken}` : `${base}/order`;
}

/** URL encoded in table QR codes — opens the public menu page. */
export function qrMenuUrl() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base}/menu`;
}

export function phoneTel() {
  return "tel:+251968626262";
}

export const SITE = {
  name: "Gize Bar & Restaurant",
  shortName: "Gize",
  domain: "https://gizebarandrestaurant.com",
  phone: "+251 96 862 6262",
  phoneRaw: "+251968626262",
  email: "gizebar@gmail.com",
  address: "Bole, Behind Mega Building",
  addressAm: "አድራሻ: ቦሌ ከሜጋ ህንፃ ጀርባ",
  city: "Addis Ababa",
  country: "Ethiopia",
  description:
    "Gize Bar & Restaurant is a luxury dining destination in Bole, Addis Ababa — where Ethiopian heritage meets international cuisine, craft cocktails, and refined nightlife.",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/menu", label: "Menu" },
  { href: "/drinks", label: "Drinks" },
  { href: "/gallery", label: "Gallery" },
  { href: "/events", label: "Events" },
  { href: "/reservations", label: "Reservations" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/contact", label: "Contact" },
] as const;

export const OPENING_HOURS = [
  { day: "Monday – Thursday", hours: "10:00 AM – 12:00 AM" },
  { day: "Friday – Saturday", hours: "10:00 AM – 2:00 AM" },
  { day: "Sunday", hours: "11:00 AM – 11:00 PM" },
] as const;
