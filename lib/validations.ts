import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const userAdminSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(["SUPER_ADMIN", "RESERVATION_MANAGER", "CONTENT_EDITOR"]),
  password: z.string().min(12).optional(),
  isActive: z.boolean().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  type: z.enum(["food", "drink"]),
  image: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export const eventAdminSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().optional().nullable(),
  shortDesc: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  price: z.string().optional().nullable(),
  capacity: z.number().int().optional().nullable(),
  isFeatured: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

const videoUrlSchema = z
  .string()
  .optional()
  .nullable()
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const url = new URL(val);
        if (url.protocol !== "https:" && url.protocol !== "http:") return false;
        const host = url.hostname.toLowerCase();
        return (
          host === "res.cloudinary.com" ||
          host.includes("cloudinary") ||
          host === "www.youtube.com" ||
          host === "youtube.com" ||
          host === "www.youtube-nocookie.com" ||
          host === "youtube-nocookie.com" ||
          host === "youtu.be" ||
          host === "player.vimeo.com" ||
          host === "vimeo.com" ||
          host === "www.vimeo.com" ||
          url.pathname.endsWith(".mp4") ||
          url.pathname.endsWith(".webm") ||
          url.pathname.endsWith(".mov")
        );
      } catch {
        return false;
      }
    },
    { message: "Video URL must be a Cloudinary, MP4, YouTube, or Vimeo link" }
  );

export const galleryAdminSchema = z.object({
  title: z.string().min(2),
  image: z.string().min(1),
  videoUrl: videoUrlSchema,
  type: z.enum(["PHOTO", "VIDEO"]).optional(),
  category: z.string().min(2),
  alt: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export const testimonialAdminSchema = z.object({
  name: z.string().min(2),
  role: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  content: z.string().min(10),
  rating: z.number().int().min(1).max(5),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export const teamAdminSchema = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
  bio: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export const socialLinkSchema = z.object({
  platform: z.string().min(2),
  url: z.string().url(),
  icon: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const reservationSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  phone: z.string().min(8, "Valid phone required").max(30),
  email: z.string().email("Valid email required").max(200),
  guests: z.number().int().min(1).max(50),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  specialRequests: z.string().max(2000).optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Valid email required").max(200),
  phone: z.string().max(30).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

export const newsletterSchema = z.object({
  email: z.string().email("Valid email required").max(200),
});

export const eventBookingSchema = z.object({
  eventId: z.string().min(1).max(100),
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  phone: z.string().min(8).max(30),
  guests: z.number().int().min(1).max(200),
  message: z.string().max(2000).optional(),
});

export const reservationStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
  "NO_SHOW",
]);

export const contactStatusSchema = z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"]);

export const eventBookingStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
]);

export const settingKeySchema = z.enum(["site", "seo", "social", "hours", "branding"]);

export const menuItemSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  categoryId: z.string().min(1),
  image: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  calories: z.number().int().optional().nullable(),
  prepTime: z.number().int().optional().nullable(),
  tags: z.array(z.string()).optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isSignature: z.boolean().optional(),
  isChefPick: z.boolean().optional(),
  isTodaysSpecial: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export const diningTableSchema = z.object({
  number: z.number().int().min(1).max(999),
  label: z.string().optional().nullable(),
  zone: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const menuModifierSchema = z.object({
  menuItemId: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["ADD", "REMOVE"]),
  priceDelta: z.number().min(0).optional(),
  isDefault: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const orderItemModifierInputSchema = z.object({
  modifierId: z.string().min(1),
  name: z.string().min(1).optional(),
  type: z.enum(["ADD", "REMOVE"]).optional(),
  priceDelta: z.number().min(0).optional(),
});

export const orderItemInputSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
  note: z.string().max(500).optional().nullable(),
  modifiers: z.array(orderItemModifierInputSchema).max(20).optional(),
});

export const createOrderSchema = z.object({
  tableNumber: z.number().int().min(1).max(999),
  qrToken: z.string().max(128).optional().nullable(),
  guestName: z.string().max(100).optional().nullable(),
  guestPhone: z.string().max(20).optional().nullable(),
  note: z.string().max(500).optional().nullable(),
  items: z.array(orderItemInputSchema).min(1).max(30),
});

export const cateringPackageSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Package name is required"),
  tagline: z.string().optional().default(""),
  price: z.string().optional().default(""),
  guests: z.string().optional().default(""),
  minGuests: z.number().int().optional().nullable(),
  maxGuests: z.number().int().optional().nullable(),
  description: z.string().optional().default(""),
  image: z.string().optional().nullable(),
  featured: z.boolean().optional().default(false),
  highlights: z.array(z.string()).optional().default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional().default("PUBLISHED"),
  sortOrder: z.number().int().optional().default(0),
});


export type ReservationInput = z.infer<typeof reservationSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
