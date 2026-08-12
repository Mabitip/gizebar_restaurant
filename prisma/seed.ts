import { PrismaClient, type Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  SEED_CATEGORIES,
  SEED_EVENTS,
  SEED_GALLERY,
  SEED_MENU,
  SEED_TEAM,
  SEED_TESTIMONIALS,
} from "../lib/seed-data";

const prisma = new PrismaClient();

async function upsertStaff(
  email: string,
  name: string,
  password: string,
  role: Role
) {
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {
      name,
      role,
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email: email.toLowerCase(),
      name,
      passwordHash,
      role,
      passwordChangedAt: new Date(),
    },
  });
}

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@gizebarandrestaurant.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "GizeAdmin2024!";
  const reservationEmail =
    process.env.RESERVATION_EMAIL || "reservations@gizebarandrestaurant.com";
  const reservationPassword = process.env.RESERVATION_PASSWORD || "GizeReserve2024!";
  const editorEmail = process.env.EDITOR_EMAIL || "editor@gizebarandrestaurant.com";
  const editorPassword = process.env.EDITOR_PASSWORD || "GizeEditor2024!";

  await upsertStaff(adminEmail, "Gize Super Admin", adminPassword, "SUPER_ADMIN");
  await upsertStaff(
    reservationEmail,
    "Reservation Manager",
    reservationPassword,
    "RESERVATION_MANAGER"
  );
  await upsertStaff(editorEmail, "Content Editor", editorPassword, "CONTENT_EDITOR");

  // Migrate legacy role labels if any rows remain with old enum (best-effort via raw SQL skipped — handled by role rename in schema)

  for (const cat of SEED_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        type: cat.type,
        sortOrder: cat.sortOrder,
        status: "PUBLISHED",
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        type: cat.type,
        sortOrder: cat.sortOrder,
        status: "PUBLISHED",
      },
    });
  }

  const categories = await prisma.category.findMany();
  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  for (const item of SEED_MENU) {
    const categoryId = catMap[item.categorySlug];
    if (!categoryId) continue;
    await prisma.menuItem.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        images: item.image ? [item.image] : [],
        calories: item.calories,
        prepTime: item.prepTime,
        tags: item.tags,
        isFeatured: !!item.isFeatured,
        isNew: !!item.isNew,
        isBestSeller: !!item.isBestSeller,
        isSignature: !!item.isSignature,
        isChefPick: !!item.isChefPick,
        isTodaysSpecial: !!item.isTodaysSpecial,
        categoryId,
        status: "PUBLISHED",
      },
      create: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        image: item.image,
        images: item.image ? [item.image] : [],
        calories: item.calories,
        prepTime: item.prepTime,
        tags: item.tags,
        isFeatured: !!item.isFeatured,
        isNew: !!item.isNew,
        isBestSeller: !!item.isBestSeller,
        isSignature: !!item.isSignature,
        isChefPick: !!item.isChefPick,
        isTodaysSpecial: !!item.isTodaysSpecial,
        categoryId,
        status: "PUBLISHED",
      },
    });
  }

  for (const event of SEED_EVENTS) {
    const start = new Date();
    start.setDate(start.getDate() + event.daysAhead);
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {
        title: event.title,
        description: event.description,
        shortDesc: event.shortDesc,
        image: event.image,
        category: event.category,
        startDate: start,
        price: event.price,
        capacity: event.capacity,
        isFeatured: event.isFeatured,
        status: "PUBLISHED",
      },
      create: {
        title: event.title,
        slug: event.slug,
        description: event.description,
        shortDesc: event.shortDesc,
        image: event.image,
        category: event.category,
        startDate: start,
        price: event.price,
        capacity: event.capacity,
        isFeatured: event.isFeatured,
        status: "PUBLISHED",
      },
    });
  }

  await prisma.testimonial.deleteMany();
  for (const [i, t] of SEED_TESTIMONIALS.entries()) {
    await prisma.testimonial.create({
      data: {
        name: t.name,
        role: t.role,
        content: t.content,
        rating: t.rating,
        isFeatured: t.isFeatured,
        sortOrder: i,
        status: "PUBLISHED",
      },
    });
  }

  await prisma.galleryItem.deleteMany();
  for (const [i, g] of SEED_GALLERY.entries()) {
    await prisma.galleryItem.create({
      data: {
        title: g.title,
        image: g.image,
        type: g.type,
        category: g.category,
        alt: g.title,
        sortOrder: i,
        status: "PUBLISHED",
      },
    });
  }

  await prisma.teamMember.deleteMany();
  for (const [i, m] of SEED_TEAM.entries()) {
    await prisma.teamMember.create({
      data: {
        name: m.name,
        role: m.role,
        bio: m.bio,
        image: m.image,
        sortOrder: i,
        status: "PUBLISHED",
      },
    });
  }

  await prisma.socialLink.deleteMany();
  await prisma.socialLink.createMany({
    data: [
      { platform: "Instagram", url: "https://instagram.com", sortOrder: 1 },
      { platform: "Facebook", url: "https://facebook.com", sortOrder: 2 },
      { platform: "Twitter", url: "https://x.com", sortOrder: 3 },
    ],
  });

  await prisma.setting.upsert({
    where: { key: "site" },
    update: {},
    create: {
      key: "site",
      value: {
        name: "Gize Bar & Restaurant",
        phone: "+251 96 862 6262",
        email: "gizebar@gmail.com",
      },
    },
  });

  // Dining tables with QR tokens
  for (let n = 1; n <= 12; n++) {
    const token = `tbl${n.toString().padStart(2, "0")}${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
    await prisma.diningTable.upsert({
      where: { number: n },
      update: { isActive: true },
      create: {
        number: n,
        label: `Table ${n}`,
        zone: n <= 6 ? "Main Hall" : "Terrace",
        qrToken: token,
        isActive: true,
      },
    });
  }

  // Sample modifiers on featured menu items
  const featuredItems = await prisma.menuItem.findMany({
    where: { isFeatured: true },
    take: 5,
  });

  for (const item of featuredItems) {
    const existing = await prisma.menuModifier.count({ where: { menuItemId: item.id } });
    if (existing > 0) continue;

    await prisma.menuModifier.createMany({
      data: [
        { menuItemId: item.id, name: "Extra portion", type: "ADD", priceDelta: 150, sortOrder: 1 },
        { menuItemId: item.id, name: "Add cheese", type: "ADD", priceDelta: 80, sortOrder: 2 },
        { menuItemId: item.id, name: "No onion", type: "REMOVE", priceDelta: 0, sortOrder: 3 },
        { menuItemId: item.id, name: "No spice", type: "REMOVE", priceDelta: 0, sortOrder: 4 },
        { menuItemId: item.id, name: "Extra spicy", type: "ADD", priceDelta: 0, sortOrder: 5 },
      ],
    });
  }

  console.log("Seed completed successfully.");
  console.log(`SUPER_ADMIN: ${adminEmail} / ${adminPassword}`);
  console.log(`RESERVATION_MANAGER: ${reservationEmail} / ${reservationPassword}`);
  console.log(`CONTENT_EDITOR: ${editorEmail} / ${editorPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
