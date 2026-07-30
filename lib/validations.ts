import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const userAdminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["SUPER_ADMIN", "RESERVATION_MANAGER", "CONTENT_EDITOR"]),
  password: z.string().min(8).optional(),
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
  title: z.string().min(2),
  description: z.string().min(10),
  shortDesc: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  category: z.string().min(2),
  startDate: z.string().min(1),
  endDate: z.string().optional().nullable(),
  location: z.string().optional(),
  price: z.string().optional().nullable(),
  capacity: z.number().int().optional().nullable(),
  isFeatured: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export const galleryAdminSchema = z.object({
  title: z.string().min(2),
  image: z.string().min(1),
  videoUrl: z.string().optional().nullable(),
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
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(8, "Valid phone required"),
  email: z.string().email("Valid email required"),
  guests: z.number().int().min(1).max(50),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  specialRequests: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const newsletterSchema = z.object({
  email: z.string().email("Valid email required"),
});

export const eventBookingSchema = z.object({
  eventId: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  guests: z.number().int().min(1).max(200),
  message: z.string().optional(),
});

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

export type ReservationInput = z.infer<typeof reservationSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
