"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireSession } from "@/lib/auth";
import { rolesFor, type Resource } from "@/lib/permissions";
import { slugify } from "@/lib/utils";
import {
  categorySchema,
  cateringPackageSchema,
  contactStatusSchema,
  diningTableSchema,
  eventAdminSchema,
  eventBookingStatusSchema,
  galleryAdminSchema,
  menuItemSchema,
  menuModifierSchema,
  reservationStatusSchema,
  settingKeySchema,
  socialLinkSchema,
  teamAdminSchema,
  testimonialAdminSchema,
  userAdminSchema,
} from "@/lib/validations";
import { sanitizeVideoEmbedUrl } from "@/lib/video-url";
import { deleteMedia } from "@/lib/cloudinary";
import { z } from "zod";

async function guard(resource: Resource, action: "read" | "write" | "delete" | "manage" = "write") {
  return requireSession(rolesFor(resource, action));
}

async function log(
  action: string,
  entity: string,
  entityId?: string,
  details?: string,
  userId?: string
) {
  try {
    await prisma.activityLog.create({
      data: { action, entity, entityId, details, userId: userId || null },
    });
  } catch {
    // ignore when DB unavailable
  }
}

function fail(message: string) {
  return { success: false as const, message };
}
function ok(message: string) {
  return { success: true as const, message };
}

/* ─── Menu ─── */
export async function upsertMenuItem(input: z.infer<typeof menuItemSchema> & { id?: string }) {
  const session = await guard("menu", "write");
  const parsed = menuItemSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid menu item data");

  const images = (parsed.data.images || []).filter(Boolean);
  const cover = images[0] || parsed.data.image || null;

  const data = {
    name: parsed.data.name,
    description: parsed.data.description,
    price: parsed.data.price,
    categoryId: parsed.data.categoryId,
    slug: slugify(parsed.data.name),
    tags: parsed.data.tags || [],
    image: cover,
    images,
    calories: parsed.data.calories ?? null,
    prepTime: parsed.data.prepTime ?? null,
    isAvailable: parsed.data.isAvailable,
    isFeatured: parsed.data.isFeatured,
    isNew: parsed.data.isNew,
    isBestSeller: parsed.data.isBestSeller,
    isSignature: parsed.data.isSignature,
    isChefPick: parsed.data.isChefPick,
    isTodaysSpecial: parsed.data.isTodaysSpecial,
    status: parsed.data.status,
  };

  try {
    if (input.id) {
      await prisma.menuItem.update({ where: { id: input.id }, data });
      await log("UPDATE", "MenuItem", input.id, data.name, session.userId);
    } else {
      const created = await prisma.menuItem.create({ data: data as never });
      await log("CREATE", "MenuItem", created.id, data.name, session.userId);
    }
    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    revalidatePath("/drinks");
    return ok("Menu item saved");
  } catch (e) {
    console.error(e); return fail("Failed to save");
  }
}

export async function deleteMenuItems(ids: string[]) {
  const session = await guard("menu", "delete");
  try {
    await prisma.menuItem.deleteMany({ where: { id: { in: ids } } });
    await log("DELETE", "MenuItem", ids.join(","), undefined, session.userId);
    revalidatePath("/admin/menu");
    return ok("Deleted");
  } catch {
    return fail("Delete failed");
  }
}

export async function bulkPublishMenu(ids: string[], status: "PUBLISHED" | "DRAFT") {
  const session = await guard("menu", "write");
  try {
    await prisma.menuItem.updateMany({ where: { id: { in: ids } }, data: { status } });
    await log("BULK_STATUS", "MenuItem", ids.join(","), status, session.userId);
    revalidatePath("/admin/menu");
    return ok(`Marked as ${status}`);
  } catch {
    return fail("Update failed");
  }
}

/* ─── Categories ─── */
export async function upsertCategory(input: z.infer<typeof categorySchema> & { id?: string }) {
  const session = await guard("categories", "write");
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return fail("Invalid category");
  const data = {
    name: parsed.data.name,
    slug: slugify(parsed.data.name),
    description: parsed.data.description || null,
    type: parsed.data.type,
    image: parsed.data.image || null,
    sortOrder: parsed.data.sortOrder ?? 0,
    status: parsed.data.status ?? "PUBLISHED",
  };
  try {
    if (input.id) {
      await prisma.category.update({ where: { id: input.id }, data });
      await log("UPDATE", "Category", input.id, data.name, session.userId);
    } else {
      const created = await prisma.category.create({ data });
      await log("CREATE", "Category", created.id, data.name, session.userId);
    }
    revalidatePath("/admin/categories");
    revalidatePath("/menu");
    return ok("Category saved");
  } catch (e) {
    console.error(e); return fail("Failed to save");
  }
}

export async function deleteCategories(ids: string[]) {
  const session = await guard("categories", "delete");
  try {
    await prisma.category.deleteMany({ where: { id: { in: ids } } });
    await log("DELETE", "Category", ids.join(","), undefined, session.userId);
    revalidatePath("/admin/categories");
    return ok("Deleted");
  } catch {
    return fail("Delete failed — categories with menu items cannot be removed.");
  }
}

/* ─── Reservations ─── */
export async function updateReservationStatus(id: string, status: string, notes?: string) {
  const session = await guard("reservations", "write");
  const parsedStatus = reservationStatusSchema.safeParse(status);
  if (!parsedStatus.success) return fail("Invalid reservation status");
  try {
    await prisma.reservation.update({
      where: { id },
      data: {
        status: parsedStatus.data,
        ...(notes !== undefined ? { notes } : {}),
      },
    });
    await log("UPDATE", "Reservation", id, parsedStatus.data, session.userId);
    revalidatePath("/admin/reservations");
    return ok("Reservation updated");
  } catch {
    return fail("Update failed");
  }
}

export async function deleteReservations(ids: string[]) {
  const session = await guard("reservations", "delete");
  try {
    await prisma.reservation.deleteMany({ where: { id: { in: ids } } });
    await log("DELETE", "Reservation", ids.join(","), undefined, session.userId);
    revalidatePath("/admin/reservations");
    return ok("Deleted");
  } catch {
    return fail("Delete failed");
  }
}

/* ─── Events ─── */
export async function upsertEvent(input: z.infer<typeof eventAdminSchema> & { id?: string }) {
  const session = await guard("events", "write");
  const parsed = eventAdminSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message || "Invalid event data";
    return fail(issue);
  }

  const baseSlug = slugify(parsed.data.title) || `event-${Date.now()}`;
  let slug = baseSlug;

  try {
    const existing = await prisma.event.findFirst({
      where: {
        slug,
        ...(input.id ? { id: { not: input.id } } : {}),
      },
    });
    if (existing) {
      slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }
  } catch {
    // ignore
  }

  let startParsed = new Date();
  if (parsed.data.startDate) {
    const d = new Date(parsed.data.startDate);
    if (!isNaN(d.getTime())) {
      startParsed = d;
    }
  }

  const data = {
    title: parsed.data.title,
    slug,
    description: parsed.data.description,
    shortDesc: parsed.data.shortDesc || null,
    image: parsed.data.image || null,
    category: parsed.data.category || "live-music",
    startDate: startParsed,
    endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    location: parsed.data.location || "Gize Bar & Restaurant",
    price: parsed.data.price || null,
    capacity: parsed.data.capacity ?? null,
    isFeatured: parsed.data.isFeatured ?? false,
    status: parsed.data.status ?? "PUBLISHED",
  };

  try {
    if (input.id && !input.id.startsWith("seed-")) {
      await prisma.event.update({ where: { id: input.id }, data });
      await log("UPDATE", "Event", input.id, data.title, session.userId);
    } else {
      const created = await prisma.event.create({ data });
      await log("CREATE", "Event", created.id, data.title, session.userId);
    }
    revalidatePath("/admin/events");
    revalidatePath("/events");
    return ok("Event saved successfully");
  } catch (e) {
    console.error("Save event failed:", e);
    return fail("Failed to save event.");
  }
}

export async function deleteEvents(ids: string[]) {
  const session = await guard("events", "delete");
  try {
    const realIds = ids.filter((id) => !id.startsWith("seed-"));
    if (realIds.length > 0) {
      await prisma.event.deleteMany({ where: { id: { in: realIds } } });
      await log("DELETE", "Event", realIds.join(","), undefined, session.userId);
    }
    revalidatePath("/admin/events");
    revalidatePath("/events");
    return ok("Event deleted successfully");
  } catch (e) {
    console.error("Delete event failed:", e);
    return fail("Delete failed");
  }
}

export async function deleteEvent(id: string) {
  return deleteEvents([id]);
}

export async function updateEventBookingStatus(id: string, status: string) {
  const session = await guard("eventBookings", "write");
  const parsedStatus = eventBookingStatusSchema.safeParse(status);
  if (!parsedStatus.success) return fail("Invalid booking status");
  try {
    await prisma.eventBooking.update({
      where: { id },
      data: { status: parsedStatus.data },
    });
    await log("UPDATE", "EventBooking", id, parsedStatus.data, session.userId);
    revalidatePath("/admin/bookings");
    return ok("Booking updated");
  } catch {
    return fail("Update failed");
  }
}

export async function deleteEventBookings(ids: string[]) {
  const session = await guard("eventBookings", "delete");
  try {
    await prisma.eventBooking.deleteMany({ where: { id: { in: ids } } });
    await log("DELETE", "EventBooking", ids.join(","), undefined, session.userId);
    revalidatePath("/admin/bookings");
    return ok("Deleted");
  } catch {
    return fail("Delete failed");
  }
}

/* ─── Gallery ─── */
export async function upsertGalleryItem(
  input: z.infer<typeof galleryAdminSchema> & { id?: string }
) {
  const session = await guard("gallery", "write");
  const parsed = galleryAdminSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid gallery item");
  const embed = sanitizeVideoEmbedUrl(parsed.data.videoUrl);
  if (parsed.data.type === "VIDEO" && parsed.data.videoUrl && !embed) {
    return fail("Video URL must be a valid Cloudinary, MP4, YouTube, or Vimeo link");
  }
  const data = {
    title: parsed.data.title,
    image: parsed.data.image,
    videoUrl: embed || null,
    type: parsed.data.type ?? "PHOTO",
    category: parsed.data.category,
    alt: parsed.data.alt || parsed.data.title,
    sortOrder: parsed.data.sortOrder ?? 0,
    status: parsed.data.status ?? "PUBLISHED",
  };
  try {
    if (input.id) {
      await prisma.galleryItem.update({ where: { id: input.id }, data });
      await log("UPDATE", "GalleryItem", input.id, data.title, session.userId);
    } else {
      const created = await prisma.galleryItem.create({ data });
      await log("CREATE", "GalleryItem", created.id, data.title, session.userId);
    }
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    return ok("Gallery item saved");
  } catch (e) {
    console.error(e); return fail("Failed to save");
  }
}

export async function deleteGalleryItems(ids: string[]) {
  const session = await guard("gallery", "delete");
  try {
    await prisma.galleryItem.deleteMany({ where: { id: { in: ids } } });
    await log("DELETE", "GalleryItem", ids.join(","), undefined, session.userId);
    revalidatePath("/admin/gallery");
    return ok("Deleted");
  } catch {
    return fail("Delete failed");
  }
}

/* ─── Testimonials ─── */
export async function upsertTestimonial(
  input: z.infer<typeof testimonialAdminSchema> & { id?: string }
) {
  const session = await guard("testimonials", "write");
  const parsed = testimonialAdminSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid testimonial");
  const data = {
    name: parsed.data.name,
    role: parsed.data.role || null,
    avatar: parsed.data.avatar || null,
    content: parsed.data.content,
    rating: parsed.data.rating,
    isFeatured: parsed.data.isFeatured ?? false,
    sortOrder: parsed.data.sortOrder ?? 0,
    status: parsed.data.status ?? "PUBLISHED",
  };
  try {
    if (input.id) {
      await prisma.testimonial.update({ where: { id: input.id }, data });
      await log("UPDATE", "Testimonial", input.id, data.name, session.userId);
    } else {
      const created = await prisma.testimonial.create({ data });
      await log("CREATE", "Testimonial", created.id, data.name, session.userId);
    }
    revalidatePath("/admin/testimonials");
    revalidatePath("/testimonials");
    return ok("Testimonial saved");
  } catch (e) {
    console.error(e); return fail("Failed to save");
  }
}

export async function deleteTestimonials(ids: string[]) {
  const session = await guard("testimonials", "delete");
  try {
    await prisma.testimonial.deleteMany({ where: { id: { in: ids } } });
    await log("DELETE", "Testimonial", ids.join(","), undefined, session.userId);
    revalidatePath("/admin/testimonials");
    return ok("Deleted");
  } catch {
    return fail("Delete failed");
  }
}

/* ─── Team ─── */
export async function upsertTeamMember(input: z.infer<typeof teamAdminSchema> & { id?: string }) {
  const session = await guard("team", "write");
  const parsed = teamAdminSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid team member");
  const data = {
    name: parsed.data.name,
    role: parsed.data.role,
    bio: parsed.data.bio || null,
    image: parsed.data.image || null,
    sortOrder: parsed.data.sortOrder ?? 0,
    status: parsed.data.status ?? "PUBLISHED",
  };
  try {
    if (input.id) {
      await prisma.teamMember.update({ where: { id: input.id }, data });
      await log("UPDATE", "TeamMember", input.id, data.name, session.userId);
    } else {
      const created = await prisma.teamMember.create({ data });
      await log("CREATE", "TeamMember", created.id, data.name, session.userId);
    }
    revalidatePath("/admin/team");
    revalidatePath("/about");
    return ok("Team member saved");
  } catch (e) {
    console.error(e); return fail("Failed to save");
  }
}

export async function deleteTeamMembers(ids: string[]) {
  const session = await guard("team", "delete");
  try {
    await prisma.teamMember.deleteMany({ where: { id: { in: ids } } });
    await log("DELETE", "TeamMember", ids.join(","), undefined, session.userId);
    revalidatePath("/admin/team");
    return ok("Deleted");
  } catch {
    return fail("Delete failed");
  }
}

/* ─── Contacts / Newsletter ─── */
export async function updateContactStatus(id: string, status: string) {
  const session = await guard("contacts", "write");
  const parsedStatus = contactStatusSchema.safeParse(status);
  if (!parsedStatus.success) return fail("Invalid contact status");
  try {
    await prisma.contactMessage.update({
      where: { id },
      data: { status: parsedStatus.data },
    });
    await log("UPDATE", "ContactMessage", id, parsedStatus.data, session.userId);
    revalidatePath("/admin/contacts");
    return ok("Contact updated");
  } catch {
    return fail("Update failed");
  }
}

export async function deleteContacts(ids: string[]) {
  const session = await guard("contacts", "delete");
  try {
    await prisma.contactMessage.deleteMany({ where: { id: { in: ids } } });
    await log("DELETE", "ContactMessage", ids.join(","), undefined, session.userId);
    revalidatePath("/admin/contacts");
    return ok("Deleted");
  } catch {
    return fail("Delete failed");
  }
}

export async function setNewsletterActive(ids: string[], isActive: boolean) {
  const session = await guard("newsletter", "write");
  try {
    await prisma.newsletter.updateMany({ where: { id: { in: ids } }, data: { isActive } });
    await log("UPDATE", "Newsletter", ids.join(","), String(isActive), session.userId);
    revalidatePath("/admin/newsletter");
    return ok(isActive ? "Activated" : "Deactivated");
  } catch {
    return fail("Update failed");
  }
}

export async function deleteNewsletter(ids: string[]) {
  const session = await guard("newsletter", "delete");
  try {
    await prisma.newsletter.deleteMany({ where: { id: { in: ids } } });
    await log("DELETE", "Newsletter", ids.join(","), undefined, session.userId);
    revalidatePath("/admin/newsletter");
    return ok("Deleted");
  } catch {
    return fail("Delete failed");
  }
}

/* ─── Users (SUPER_ADMIN) ─── */
export async function upsertUser(input: z.infer<typeof userAdminSchema> & { id?: string }) {
  const session = await guard("users", "write");
  const parsed = userAdminSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid user data");

  try {
    if (input.id) {
      const data: {
        name: string;
        email: string;
        role: Role;
        isActive?: boolean;
        passwordHash?: string;
        passwordChangedAt?: Date;
      } = {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        role: parsed.data.role,
        isActive: parsed.data.isActive,
      };
      if (parsed.data.password) {
        data.passwordHash = await hashPassword(parsed.data.password);
        data.passwordChangedAt = new Date();
      }
      await prisma.user.update({ where: { id: input.id }, data });
      await log("UPDATE", "User", input.id, parsed.data.email, session.userId);
    } else {
      if (!parsed.data.password) return fail("Password required for new users");
      const created = await prisma.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email.toLowerCase(),
          role: parsed.data.role,
          isActive: parsed.data.isActive ?? true,
          passwordHash: await hashPassword(parsed.data.password),
          passwordChangedAt: new Date(),
        },
      });
      await log("CREATE", "User", created.id, created.email, session.userId);
    }
    revalidatePath("/admin/users");
    return ok("User saved");
  } catch (e) {
    console.error(e); return fail("Failed to save");
  }
}

export async function deleteUsers(ids: string[]) {
  const session = await guard("users", "delete");
  try {
    const filtered = ids.filter((id) => id !== session.userId);
    if (!filtered.length) return fail("You cannot delete your own account");
    await prisma.user.deleteMany({ where: { id: { in: filtered } } });
    await log("DELETE", "User", filtered.join(","), undefined, session.userId);
    revalidatePath("/admin/users");
    return ok("Deleted");
  } catch {
    return fail("Delete failed");
  }
}

/* ─── Settings / Social ─── */
export async function saveSetting(key: string, value: unknown) {
  const session = await guard("settings", "write");
  const parsedKey = settingKeySchema.safeParse(key);
  if (!parsedKey.success) return fail("Invalid settings key");
  try {
    await prisma.setting.upsert({
      where: { key: parsedKey.data },
      update: { value: value as object },
      create: { key: parsedKey.data, value: value as object },
    });
    await log("UPDATE", "Setting", parsedKey.data, undefined, session.userId);
    revalidatePath("/admin/settings");
    return ok("Settings saved");
  } catch {
    return fail("Could not save settings");
  }
}

export async function upsertSocialLink(
  input: z.infer<typeof socialLinkSchema> & { id?: string }
) {
  const session = await guard("settings", "write");
  const parsed = socialLinkSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid social link");
  const data = {
    platform: parsed.data.platform,
    url: parsed.data.url,
    icon: parsed.data.icon || null,
    sortOrder: parsed.data.sortOrder ?? 0,
    isActive: parsed.data.isActive ?? true,
  };
  try {
    if (input.id) {
      await prisma.socialLink.update({ where: { id: input.id }, data });
    } else {
      await prisma.socialLink.create({ data });
    }
    await log("UPSERT", "SocialLink", input.id, data.platform, session.userId);
    revalidatePath("/admin/settings");
    return ok("Social link saved");
  } catch {
    return fail("Failed to save");
  }
}

export async function deleteSocialLinks(ids: string[]) {
  const session = await guard("settings", "delete");
  try {
    await prisma.socialLink.deleteMany({ where: { id: { in: ids } } });
    await log("DELETE", "SocialLink", ids.join(","), undefined, session.userId);
    revalidatePath("/admin/settings");
    return ok("Deleted");
  } catch {
    return fail("Delete failed");
  }
}

/* ─── Catering Packages ─── */
export async function upsertCateringPackage(
  input: z.infer<typeof cateringPackageSchema>
) {
  const session = await guard("catering", "write");
  const parsed = cateringPackageSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message || "Invalid package data";
    return fail(issue);
  }

  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "catering_packages" },
    });
    const existingList: Array<z.infer<typeof cateringPackageSchema>> =
      setting?.value && Array.isArray(setting.value)
        ? (setting.value as Array<z.infer<typeof cateringPackageSchema>>)
        : (await import("@/lib/seed-data")).SEED_CATERING_PACKAGES;

    const baseSlug = slugify(parsed.data.name) || `pkg-${Date.now()}`;
    const id = parsed.data.id || `pkg-${Date.now()}-${randomBytes(2).toString("hex")}`;

    const newPkg = {
      id,
      name: parsed.data.name,
      slug: baseSlug,
      tagline: parsed.data.tagline || "",
      price: parsed.data.price || "",
      guests: parsed.data.guests || "",
      minGuests: parsed.data.minGuests || undefined,
      maxGuests: parsed.data.maxGuests || undefined,
      description: parsed.data.description || "",
      image: parsed.data.image || null,
      featured: parsed.data.featured ?? false,
      highlights: parsed.data.highlights || [],
      status: parsed.data.status ?? "PUBLISHED",
      sortOrder: parsed.data.sortOrder ?? existingList.length + 1,
    };

    let updatedList: typeof existingList;
    if (parsed.data.id) {
      const idx = existingList.findIndex((p) => p.id === parsed.data.id);
      if (idx >= 0) {
        updatedList = [...existingList];
        updatedList[idx] = newPkg;
      } else {
        updatedList = [...existingList, newPkg];
      }
    } else {
      updatedList = [...existingList, newPkg];
    }

    await prisma.setting.upsert({
      where: { key: "catering_packages" },
      update: { value: updatedList },
      create: { key: "catering_packages", value: updatedList },
    });

    await log("UPSERT", "CateringPackage", id, newPkg.name, session.userId);
    revalidatePath("/admin/catering");
    revalidatePath("/catering");
    revalidatePath("/services/catering");
    revalidatePath("/services");
    return ok("Catering package saved successfully");
  } catch (e) {
    console.error("Failed to save catering package:", e);
    return fail("Failed to save catering package.");
  }
}

export async function deleteCateringPackages(ids: string[]) {
  const session = await guard("catering", "delete");
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "catering_packages" },
    });
    const existingList: Array<z.infer<typeof cateringPackageSchema>> =
      setting?.value && Array.isArray(setting.value)
        ? (setting.value as Array<z.infer<typeof cateringPackageSchema>>)
        : (await import("@/lib/seed-data")).SEED_CATERING_PACKAGES;

    const idsSet = new Set(ids);
    const updatedList = existingList.filter((p) => !idsSet.has(p.id || ""));

    await prisma.setting.upsert({
      where: { key: "catering_packages" },
      update: { value: updatedList },
      create: { key: "catering_packages", value: updatedList },
    });

    await log("DELETE", "CateringPackage", ids.join(","), undefined, session.userId);
    revalidatePath("/admin/catering");
    revalidatePath("/catering");
    revalidatePath("/services/catering");
    return ok("Package deleted successfully");
  } catch (e) {
    console.error("Delete catering package failed:", e);
    return fail("Delete failed");
  }
}

/* ─── Dining Tables ─── */

function generateQrToken() {
  return randomBytes(16).toString("hex");
}

export async function upsertDiningTable(
  input: z.infer<typeof diningTableSchema> & { id?: string }
) {
  const session = await guard("tables", "write");
  const parsed = diningTableSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid table data");

  const data = {
    number: parsed.data.number,
    label: parsed.data.label || null,
    zone: parsed.data.zone || null,
    isActive: parsed.data.isActive ?? true,
  };

  try {
    if (input.id) {
      await prisma.diningTable.update({ where: { id: input.id }, data });
      await log("UPDATE", "DiningTable", input.id, `Table ${data.number}`, session.userId);
    } else {
      await prisma.diningTable.create({
        data: { ...data, qrToken: generateQrToken() },
      });
      await log("CREATE", "DiningTable", undefined, `Table ${data.number}`, session.userId);
    }
    revalidatePath("/admin/tables");
    return ok("Table saved");
  } catch {
    return fail("Could not save table. Number may already exist.");
  }
}

export async function deleteDiningTables(ids: string[]) {
  const session = await guard("tables", "delete");
  try {
    await prisma.diningTable.deleteMany({ where: { id: { in: ids } } });
    await log("DELETE", "DiningTable", ids.join(","), undefined, session.userId);
    revalidatePath("/admin/tables");
    return ok("Tables deleted");
  } catch {
    return fail("Delete failed");
  }
}

export async function regenerateTableQrToken(id: string) {
  const session = await guard("tables", "write");
  try {
    await prisma.diningTable.update({
      where: { id },
      data: { qrToken: generateQrToken() },
    });
    await log("REGENERATE_QR", "DiningTable", id, undefined, session.userId);
    revalidatePath("/admin/tables");
    return ok("QR code regenerated");
  } catch {
    return fail("Could not regenerate QR code");
  }
}

/* ─── Menu Modifiers ─── */
export async function upsertMenuModifier(
  input: z.infer<typeof menuModifierSchema> & { id?: string }
) {
  const session = await guard("menu", "write");
  const parsed = menuModifierSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid modifier data");

  const data = {
    menuItemId: parsed.data.menuItemId,
    name: parsed.data.name,
    type: parsed.data.type,
    priceDelta: parsed.data.type === "REMOVE" ? 0 : (parsed.data.priceDelta ?? 0),
    isDefault: parsed.data.isDefault ?? false,
    sortOrder: parsed.data.sortOrder ?? 0,
    isActive: parsed.data.isActive ?? true,
  };

  try {
    if (input.id) {
      await prisma.menuModifier.update({ where: { id: input.id }, data });
    } else {
      await prisma.menuModifier.create({ data });
    }
    await log("UPSERT", "MenuModifier", input.id, data.name, session.userId);
    revalidatePath("/admin/menu");
    return ok("Modifier saved");
  } catch {
    return fail("Could not save modifier");
  }
}

export async function deleteMenuModifiers(ids: string[]) {
  const session = await guard("menu", "delete");
  try {
    await prisma.menuModifier.deleteMany({ where: { id: { in: ids } } });
    await log("DELETE", "MenuModifier", ids.join(","), undefined, session.userId);
    revalidatePath("/admin/menu");
    return ok("Modifiers deleted");
  } catch {
    return fail("Delete failed");
  }
}

/* ─── Media Library ─── */
export async function deleteMediaItem(id: string) {
  const session = await guard("media", "delete");
  try {
    const item = await prisma.media.findUnique({ where: { id } });
    if (!item) return fail("Media not found");

    if (item.publicId) {
      const isVideo = item.mimeType?.startsWith("video/") || item.url.includes("/video/upload/");
      await deleteMedia(item.publicId, isVideo ? "video" : "image");
    }

    await prisma.media.delete({ where: { id } });
    await log("DELETE", "Media", id, item.filename || item.url, session.userId);
    revalidatePath("/admin/media");
    return ok("Media deleted");
  } catch (e) {
    console.error(e);
    return fail("Failed to delete media item");
  }
}

export async function bulkDeleteMedia(ids: string[]) {
  const session = await guard("media", "delete");
  try {
    const items = await prisma.media.findMany({ where: { id: { in: ids } } });
    for (const item of items) {
      if (item.publicId) {
        const isVideo = item.mimeType?.startsWith("video/") || item.url.includes("/video/upload/");
        await deleteMedia(item.publicId, isVideo ? "video" : "image");
      }
    }
    await prisma.media.deleteMany({ where: { id: { in: ids } } });
    await log("BULK_DELETE", "Media", ids.join(","), undefined, session.userId);
    revalidatePath("/admin/media");
    return ok(`Deleted ${ids.length} media item(s)`);
  } catch (e) {
    console.error(e);
    return fail("Failed to delete media items");
  }
}

