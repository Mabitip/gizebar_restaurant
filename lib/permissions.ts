import type { Role } from "@prisma/client";
import type { SessionPayload } from "@/lib/auth";

export type PermissionAction = "read" | "write" | "delete" | "manage";

export type Resource =
  | "overview"
  | "analytics"
  | "users"
  | "settings"
  | "reservations"
  | "eventBookings"
  | "contacts"
  | "newsletter"
  | "menu"
  | "categories"
  | "catering"
  | "events"
  | "gallery"
  | "team"
  | "testimonials"
  | "media"
  | "activity"
  | "orders"
  | "tables";

type Rule = {
  read?: Role[];
  write?: Role[];
  delete?: Role[];
  manage?: Role[];
};

const ALL: Role[] = ["SUPER_ADMIN", "RESERVATION_MANAGER", "CONTENT_EDITOR"];
const SUPER: Role[] = ["SUPER_ADMIN"];
const OPS: Role[] = ["SUPER_ADMIN", "RESERVATION_MANAGER"];
const CONTENT: Role[] = ["SUPER_ADMIN", "CONTENT_EDITOR"];

const MATRIX: Record<Resource, Rule> = {
  overview: { read: ALL },
  analytics: { read: ALL },
  users: { read: SUPER, write: SUPER, delete: SUPER, manage: SUPER },
  settings: { read: SUPER, write: SUPER, manage: SUPER },
  reservations: { read: OPS, write: OPS, delete: OPS, manage: OPS },
  eventBookings: { read: OPS, write: OPS, delete: OPS, manage: OPS },
  contacts: { read: OPS, write: OPS, delete: OPS, manage: OPS },
  newsletter: { read: OPS, write: OPS, delete: OPS, manage: OPS },
  menu: { read: CONTENT, write: CONTENT, delete: CONTENT, manage: CONTENT },
  categories: { read: CONTENT, write: CONTENT, delete: CONTENT, manage: CONTENT },
  catering: { read: CONTENT, write: CONTENT, delete: CONTENT, manage: CONTENT },
  events: { read: CONTENT, write: CONTENT, delete: CONTENT, manage: CONTENT },
  gallery: { read: CONTENT, write: CONTENT, delete: CONTENT, manage: CONTENT },
  team: { read: CONTENT, write: CONTENT, delete: CONTENT, manage: CONTENT },
  testimonials: { read: CONTENT, write: CONTENT, delete: CONTENT, manage: CONTENT },
  media: { read: CONTENT, write: CONTENT, delete: CONTENT, manage: CONTENT },
  activity: { read: ALL },
  orders: { read: OPS, write: OPS, delete: OPS, manage: OPS },
  tables: { read: OPS, write: OPS, delete: OPS, manage: OPS },
};

export function can(
  session: Pick<SessionPayload, "role"> | null | undefined,
  resource: Resource,
  action: PermissionAction = "read"
): boolean {
  if (!session) return false;
  const roles = MATRIX[resource]?.[action];
  if (!roles) return false;
  return roles.includes(session.role);
}

export function rolesFor(resource: Resource, action: PermissionAction = "write"): Role[] {
  return MATRIX[resource][action] ?? SUPER;
}

export function homePathForRole(role: Role): string {
  switch (role) {
    case "RESERVATION_MANAGER":
      return "/admin/reservations";
    case "CONTENT_EDITOR":
      return "/admin/menu";
    default:
      return "/admin";
  }
}

export function roleLabel(role: Role): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin";
    case "RESERVATION_MANAGER":
      return "Reservation Manager";
    case "CONTENT_EDITOR":
      return "Content Editor";
    default:
      return role;
  }
}

export type NavItem = {
  href: string;
  label: string;
  resource: Resource;
  icon:
    | "dashboard"
    | "menu"
    | "categories"
    | "catering"
    | "reservations"
    | "events"
    | "bookings"
    | "gallery"
    | "testimonials"
    | "team"
    | "newsletter"
    | "contacts"
    | "media"
    | "analytics"
    | "users"
    | "settings"
    | "orders"
    | "tables";
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Overview", resource: "overview", icon: "dashboard" },
  { href: "/admin/menu", label: "Menu", resource: "menu", icon: "menu" },
  { href: "/admin/categories", label: "Categories", resource: "categories", icon: "categories" },
  { href: "/admin/catering", label: "Catering Packages", resource: "catering", icon: "catering" },
  { href: "/admin/reservations", label: "Reservations", resource: "reservations", icon: "reservations" },
  { href: "/admin/orders", label: "Orders", resource: "orders", icon: "orders" },
  { href: "/admin/tables", label: "Tables & QR", resource: "tables", icon: "tables" },
  { href: "/admin/events", label: "Events", resource: "events", icon: "events" },
  { href: "/admin/bookings", label: "Event Bookings", resource: "eventBookings", icon: "bookings" },
  { href: "/admin/gallery", label: "Gallery", resource: "gallery", icon: "gallery" },
  { href: "/admin/testimonials", label: "Testimonials", resource: "testimonials", icon: "testimonials" },
  { href: "/admin/team", label: "Team", resource: "team", icon: "team" },
  { href: "/admin/newsletter", label: "Newsletter", resource: "newsletter", icon: "newsletter" },
  { href: "/admin/contacts", label: "Contacts", resource: "contacts", icon: "contacts" },
  { href: "/admin/media", label: "Media Library", resource: "media", icon: "media" },
  { href: "/admin/analytics", label: "Analytics", resource: "analytics", icon: "analytics" },
  { href: "/admin/users", label: "Users", resource: "users", icon: "users" },
  { href: "/admin/settings", label: "Settings", resource: "settings", icon: "settings" },
];

export function navFor(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => can({ role }, item.resource, "read"));
}

/** Map admin path prefix → resource for middleware */
export function resourceForPath(pathname: string): Resource | null {
  if (pathname === "/admin" || pathname === "/admin/") return "overview";
  const map: [string, Resource][] = [
    ["/admin/users", "users"],
    ["/admin/settings", "settings"],
    ["/admin/reservations", "reservations"],
    ["/admin/orders", "orders"],
    ["/admin/tables", "tables"],
    ["/admin/bookings", "eventBookings"],
    ["/admin/contacts", "contacts"],
    ["/admin/newsletter", "newsletter"],
    ["/admin/menu", "menu"],
    ["/admin/categories", "categories"],
    ["/admin/catering", "catering"],
    ["/admin/events", "events"],
    ["/admin/gallery", "gallery"],
    ["/admin/team", "team"],
    ["/admin/testimonials", "testimonials"],
    ["/admin/media", "media"],
    ["/admin/analytics", "analytics"],
  ];
  for (const [prefix, resource] of map) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return resource;
  }
  return null;
}
