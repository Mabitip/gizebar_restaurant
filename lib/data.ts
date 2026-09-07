import {
  SEED_CATEGORIES,
  SEED_CATERING_PACKAGES,
  type CateringPackage,
  SEED_EVENTS,
  SEED_GALLERY,
  SEED_MENU,
  SEED_TEAM,
  SEED_TESTIMONIALS,
} from "@/lib/seed-data";

export type MenuItemView = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string | null;
  images: string[];
  calories: number | null;
  prepTime: number | null;
  tags: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isSignature: boolean;
  isChefPick: boolean;
  isTodaysSpecial: boolean;
  category: { id: string; name: string; slug: string; type: string };
};

export type MenuModifierView = {
  id: string;
  name: string;
  type: "ADD" | "REMOVE";
  priceDelta: number;
  isDefault: boolean;
  sortOrder: number;
};

export type OrderMenuItemView = MenuItemView & {
  modifiers: MenuModifierView[];
};

function staticMenu(): MenuItemView[] {
  return SEED_MENU.map((item, i) => {
    const cat = SEED_CATEGORIES.find((c) => c.slug === item.categorySlug)!;
    return {
      id: `static-${i}`,
      name: item.name,
      slug: item.slug,
      description: item.description,
      price: item.price,
      image: item.image,
      images: item.image ? [item.image] : [],
      calories: item.calories ?? null,
      prepTime: item.prepTime ?? null,
      tags: item.tags,
      isAvailable: true,
      isFeatured: !!item.isFeatured,
      isNew: !!item.isNew,
      isBestSeller: !!item.isBestSeller,
      isSignature: !!item.isSignature,
      isChefPick: !!item.isChefPick,
      isTodaysSpecial: !!item.isTodaysSpecial,
      category: {
        id: cat.slug,
        name: cat.name,
        slug: cat.slug,
        type: cat.type,
      },
    };
  });
}

function hasLiveDatabase() {
  const url = process.env.DATABASE_URL || "";
  if (!url) return false;
  // Skip placeholder credentials from .env.example
  if (url.includes("user:password@")) return false;
  return true;
}

/** After a connection failure, skip Prisma for the rest of this process (e.g. Neon unreachable). */
let databaseUnreachable = false;

async function tryPrisma<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    if (!hasLiveDatabase() || databaseUnreachable) return fallback;
    return await fn();
  } catch {
    databaseUnreachable = true;
    return fallback;
  }
}

export async function getMenuItems(opts?: {
  type?: "food" | "drink";
  category?: string;
  search?: string;
  featured?: boolean;
  signature?: boolean;
  chefPick?: boolean;
  todaysSpecial?: boolean;
  cocktails?: boolean;
}): Promise<MenuItemView[]> {
  const fallback = staticMenu().filter((item) => {
    if (opts?.type && item.category.type !== opts.type) return false;
    if (opts?.category && item.category.slug !== opts.category) return false;
    if (opts?.featured && !item.isFeatured) return false;
    if (opts?.signature && !item.isSignature) return false;
    if (opts?.chefPick && !item.isChefPick) return false;
    if (opts?.todaysSpecial && !item.isTodaysSpecial) return false;
    if (opts?.cocktails && item.category.slug !== "cocktails") return false;
    if (opts?.search) {
      const q = opts.search.toLowerCase();
      if (
        !item.name.toLowerCase().includes(q) &&
        !item.description.toLowerCase().includes(q) &&
        !item.tags.some((t) => t.includes(q))
      )
        return false;
    }
    return true;
  });

  return tryPrisma(async () => {
    const { prisma } = await import("@/lib/prisma");
    const items = await prisma.menuItem.findMany({
      where: {
        status: "PUBLISHED",
        isAvailable: true,
        ...(opts?.featured ? { isFeatured: true } : {}),
        ...(opts?.signature ? { isSignature: true } : {}),
        ...(opts?.chefPick ? { isChefPick: true } : {}),
        ...(opts?.todaysSpecial ? { isTodaysSpecial: true } : {}),
        ...(opts?.cocktails ? { category: { slug: "cocktails" } } : {}),
        ...(opts?.type ? { category: { type: opts.type, status: "PUBLISHED" } } : {}),
        ...(opts?.category ? { category: { slug: opts.category } } : {}),
        ...(opts?.search
          ? {
              OR: [
                { name: { contains: opts.search, mode: "insensitive" } },
                { description: { contains: opts.search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    if (!items.length) return fallback;
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      price: item.price,
      image: item.image,
      images:
        item.images?.length > 0
          ? item.images
          : item.image
            ? [item.image]
            : [],
      calories: item.calories,
      prepTime: item.prepTime,
      tags: item.tags,
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
      isNew: item.isNew,
      isBestSeller: item.isBestSeller,
      isSignature: item.isSignature,
      isChefPick: item.isChefPick,
      isTodaysSpecial: item.isTodaysSpecial,
      category: {
        id: item.category.id,
        name: item.category.name,
        slug: item.category.slug,
        type: item.category.type,
      },
    }));
  }, fallback);
}

export async function getCategories(type?: "food" | "drink") {
  const fallback = SEED_CATEGORIES.filter((c) => !type || c.type === type).map(
    (c) => ({
      id: c.slug,
      name: c.name,
      slug: c.slug,
      description: c.description,
      type: c.type,
      sortOrder: c.sortOrder,
    })
  );

  return tryPrisma(async () => {
    const { prisma } = await import("@/lib/prisma");
    const cats = await prisma.category.findMany({
      where: {
        status: "PUBLISHED",
        ...(type ? { type } : {}),
      },
      orderBy: { sortOrder: "asc" },
    });
    return cats.length
      ? cats.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          type: c.type,
          sortOrder: c.sortOrder,
        }))
      : fallback;
  }, fallback);
}

export async function getEvents() {
  const fallback = SEED_EVENTS.map((e, i) => {
    const start = new Date();
    start.setDate(start.getDate() + e.daysAhead);
    return {
      id: `event-${i}`,
      title: e.title,
      slug: e.slug,
      description: e.description,
      shortDesc: e.shortDesc,
      image: e.image,
      category: e.category,
      startDate: start,
      price: e.price,
      capacity: e.capacity,
      isFeatured: e.isFeatured,
    };
  });

  return tryPrisma(async () => {
    const { prisma } = await import("@/lib/prisma");
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    let events = await prisma.event.findMany({
      where: { status: "PUBLISHED", startDate: { gte: startOfToday } },
      orderBy: { startDate: "asc" },
    });

    if (!events.length) {
      events = await prisma.event.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { startDate: "desc" },
      });
    }

    return events.length ? events : fallback;
  }, fallback);
}

export async function getTestimonials() {
  const fallback = SEED_TESTIMONIALS.map((t, i) => ({
    id: `t-${i}`,
    ...t,
    avatar: null as string | null,
  }));

  return tryPrisma(async () => {
    const { prisma } = await import("@/lib/prisma");
    const list = await prisma.testimonial.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
    });
    return list.length ? list : fallback;
  }, fallback);
}

export async function getGallery(category?: string) {
  const fallback = SEED_GALLERY.filter(
    (g) => !category || category === "all" || g.category === category
  ).map((g, i) => ({
    id: `g-${i}`,
    title: g.title,
    image: g.image,
    videoUrl: null as string | null,
    type: g.type,
    category: g.category,
    alt: g.title,
  }));

  return tryPrisma(async () => {
    const { prisma } = await import("@/lib/prisma");
    const items = await prisma.galleryItem.findMany({
      where: {
        status: "PUBLISHED",
        ...(category && category !== "all" ? { category } : {}),
      },
      orderBy: { sortOrder: "asc" },
    });
    return items.length ? items : fallback;
  }, fallback);
}

export async function getTeam() {
  const fallback = SEED_TEAM.map((m, i) => ({ id: `tm-${i}`, ...m }));
  return tryPrisma(async () => {
    const { prisma } = await import("@/lib/prisma");
    const team = await prisma.teamMember.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { sortOrder: "asc" },
    });
    return team.length ? team : fallback;
  }, fallback);
}

export async function getOrderMenuItems(): Promise<OrderMenuItemView[]> {
  const fallback = staticMenu().map((item) => ({
    ...item,
    modifiers: [] as MenuModifierView[],
  }));

  return tryPrisma(async () => {
    const { prisma } = await import("@/lib/prisma");
    const items = await prisma.menuItem.findMany({
      where: {
        status: "PUBLISHED",
        isAvailable: true,
        category: { status: "PUBLISHED" },
      },
      include: {
        category: true,
        modifiers: {
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    if (!items.length) return fallback;
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      price: item.price,
      image: item.image,
      images:
        item.images?.length > 0
          ? item.images
          : item.image
            ? [item.image]
            : [],
      calories: item.calories,
      prepTime: item.prepTime,
      tags: item.tags,
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
      isNew: item.isNew,
      isBestSeller: item.isBestSeller,
      isSignature: item.isSignature,
      isChefPick: item.isChefPick,
      isTodaysSpecial: item.isTodaysSpecial,
      category: {
        id: item.category.id,
        name: item.category.name,
        slug: item.category.slug,
        type: item.category.type,
      },
      modifiers: item.modifiers.map((m) => ({
        id: m.id,
        name: m.name,
        type: m.type,
        priceDelta: m.priceDelta,
        isDefault: m.isDefault,
        sortOrder: m.sortOrder,
      })),
    }));
  }, fallback);
}

export async function getCateringPackages(): Promise<CateringPackage[]> {
  const fallback = SEED_CATERING_PACKAGES;
  return tryPrisma(async () => {
    const { prisma } = await import("@/lib/prisma");
    const setting = await prisma.setting.findUnique({
      where: { key: "catering_packages" },
    });
    if (!setting?.value || !Array.isArray(setting.value) || setting.value.length === 0) {
      return fallback;
    }
    const pkgs = setting.value as CateringPackage[];
    return pkgs.filter((p) => p.status !== "DRAFT" && p.status !== "ARCHIVED");
  }, fallback);
}

export async function getAllCateringPackagesAdmin(): Promise<CateringPackage[]> {
  const fallback = SEED_CATERING_PACKAGES;
  return tryPrisma(async () => {
    const { prisma } = await import("@/lib/prisma");
    const setting = await prisma.setting.findUnique({
      where: { key: "catering_packages" },
    });
    if (!setting?.value || !Array.isArray(setting.value) || setting.value.length === 0) {
      return fallback;
    }
    return setting.value as CateringPackage[];
  }, fallback);
}
