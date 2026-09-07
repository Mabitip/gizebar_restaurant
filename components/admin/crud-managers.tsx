"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, StatusBadge, type DataTableColumn } from "@/components/admin/data-table";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { VideoUploadField } from "@/components/admin/video-upload-field";
import {
  deleteEvents,
  deleteUsers,
  deleteGalleryItems,
  deleteTestimonials,
  deleteTeamMembers,
  deleteContacts,
  deleteNewsletter,
  deleteEventBookings,
  setNewsletterActive,
  updateContactStatus,
  updateEventBookingStatus,
  upsertEvent,
  upsertGalleryItem,
  upsertTestimonial,
  upsertTeamMember,
  upsertUser,
} from "@/actions/admin";
import type { Role } from "@prisma/client";

function FormShell({
  title,
  children,
  onSave,
  onCancel,
  pending,
}: {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  onCancel: () => void;
  pending: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
      <h3 className="font-heading text-xl">{title}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
      <div className="mt-4 flex gap-2">
        <Button onClick={onSave} disabled={pending}>
          Save
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function EventsManager({
  events,
}: {
  events: {
    id: string;
    title: string;
    category: string;
    startDate: string | Date;
    status: string;
    isFeatured: boolean;
    description: string;
    shortDesc?: string | null;
    image?: string | null;
    price?: string | null;
    capacity?: number | null;
  }[];
}) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [form, setForm] = useState({
    title: "",
    description: "",
    shortDesc: "",
    category: "live-music",
    startDate: "",
    image: "",
    price: "",
    capacity: "",
    isFeatured: false,
    status: "PUBLISHED",
  });

  const columns: DataTableColumn<(typeof events)[0]>[] = [
    { key: "title", header: "Title", sortable: true },
    { key: "category", header: "Category", sortable: true },
    {
      key: "startDate",
      header: "Starts",
      sortable: true,
      getValue: (r) => new Date(r.startDate).toISOString(),
      render: (r) => new Date(r.startDate).toLocaleString(),
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setEditId(r.id);
            setOpen(true);
            setForm({
              title: r.title,
              description: r.description,
              shortDesc: r.shortDesc || "",
              category: r.category,
              startDate: new Date(r.startDate).toISOString().slice(0, 16),
              image: r.image || "",
              price: r.price || "",
              capacity: r.capacity?.toString() || "",
              isFeatured: r.isFeatured,
              status: r.status,
            });
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        rows={events}
        columns={columns}
        searchKeys={["title", "category"]}
        onBulkDelete={(ids) =>
          start(async () => {
            const res = await deleteEvents(ids);
            res.success ? toast.success(res.message) : toast.error(res.message);
          })
        }
        toolbar={
          <Button
            size="sm"
            onClick={() => {
              setEditId(undefined);
              setOpen(true);
              setForm({
                title: "",
                description: "",
                shortDesc: "",
                category: "live-music",
                startDate: "",
                image: "",
                price: "",
                capacity: "",
                isFeatured: false,
                status: "PUBLISHED",
              });
            }}
          >
            Add Event
          </Button>
        }
      />
      {open && (
        <FormShell
          title={editId ? "Edit Event" : "New Event"}
          pending={pending}
          onCancel={() => setOpen(false)}
          onSave={() =>
            start(async () => {
              const res = await upsertEvent({
                id: editId,
                title: form.title,
                description: form.description,
                shortDesc: form.shortDesc,
                category: form.category,
                startDate: form.startDate,
                image: form.image || null,
                price: form.price || null,
                capacity: form.capacity ? Number(form.capacity) : null,
                isFeatured: form.isFeatured,
                status: form.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
              });
              if (res.success) {
                toast.success(res.message);
                setOpen(false);
              } else toast.error(res.message);
            })
          }
        >
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Start</Label>
            <Input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <ImageUploadField
              label="Image"
              value={form.image}
              onChange={(image) => setForm({ ...form, image })}
            />
        </FormShell>
      )}
    </div>
  );
}

export function UsersManager({
  users,
}: {
  users: {
    id: string;
    name: string;
    email: string;
    role: Role;
    isActive: boolean;
    lastLoginAt?: string | Date | null;
  }[];
}) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "CONTENT_EDITOR" as Role,
    password: "",
    isActive: true,
  });

  const columns: DataTableColumn<(typeof users)[0]>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "email", header: "Email", sortable: true },
    { key: "role", header: "Role", sortable: true },
    {
      key: "isActive",
      header: "Active",
      render: (r) => <StatusBadge status={r.isActive ? "ACTIVE" : "DISABLED"} />,
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setEditId(r.id);
            setOpen(true);
            setForm({
              name: r.name,
              email: r.email,
              role: r.role,
              password: "",
              isActive: r.isActive,
            });
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        rows={users}
        columns={columns}
        searchKeys={["name", "email", "role"]}
        onBulkDelete={(ids) =>
          start(async () => {
            const res = await deleteUsers(ids);
            res.success ? toast.success(res.message) : toast.error(res.message);
          })
        }
        toolbar={
          <Button
            size="sm"
            onClick={() => {
              setEditId(undefined);
              setOpen(true);
              setForm({
                name: "",
                email: "",
                role: "CONTENT_EDITOR",
                password: "",
                isActive: true,
              });
            }}
          >
            Add User
          </Button>
        }
      />
      {open && (
        <FormShell
          title={editId ? "Edit User" : "New User"}
          pending={pending}
          onCancel={() => setOpen(false)}
          onSave={() =>
            start(async () => {
              const res = await upsertUser({
                id: editId,
                name: form.name,
                email: form.email,
                role: form.role,
                password: form.password || undefined,
                isActive: form.isActive,
              });
              if (res.success) {
                toast.success(res.message);
                setOpen(false);
              } else toast.error(res.message);
            })
          }
        >
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
            >
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="RESERVATION_MANAGER">Reservation Manager</option>
              <option value="CONTENT_EDITOR">Content Editor</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>{editId ? "New password (optional)" : "Password"}</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
        </FormShell>
      )}
    </div>
  );
}

export function GalleryManager({
  items,
}: {
  items: {
    id: string;
    title: string;
    image: string;
    videoUrl?: string | null;
    category: string;
    type: string;
    status: string;
    alt?: string | null;
    sortOrder: number;
  }[];
}) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [form, setForm] = useState({
    title: "",
    image: "",
    videoUrl: "",
    category: "ambiance",
    type: "PHOTO",
    status: "PUBLISHED",
    sortOrder: 0,
  });

  return (
    <div className="space-y-6">
      <DataTable
        rows={items}
        columns={[
          { key: "title", header: "Title", sortable: true },
          { key: "category", header: "Category", sortable: true },
          {
            key: "type",
            header: "Type",
            render: (r) => (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                r.type === "VIDEO" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
              }`}>
                {r.type}
              </span>
            ),
          },
          { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            key: "actions",
            header: "",
            render: (r) => (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditId(r.id);
                  setOpen(true);
                  setForm({
                    title: r.title,
                    image: r.image,
                    videoUrl: r.videoUrl || "",
                    category: r.category,
                    type: r.type,
                    status: r.status,
                    sortOrder: r.sortOrder,
                  });
                }}
              >
                Edit
              </Button>
            ),
          },
        ]}
        searchKeys={["title", "category"]}
        onBulkDelete={(ids) =>
          start(async () => {
            const res = await deleteGalleryItems(ids);
            res.success ? toast.success(res.message) : toast.error(res.message);
          })
        }
        toolbar={
          <Button
            size="sm"
            onClick={() => {
              setEditId(undefined);
              setOpen(true);
              setForm({
                title: "",
                image: "",
                videoUrl: "",
                category: "ambiance",
                type: "PHOTO",
                status: "PUBLISHED",
                sortOrder: 0,
              });
            }}
          >
            Add Item
          </Button>
        }
      />
      {open && (
        <FormShell
          title={editId ? "Edit Gallery Item" : "New Gallery Item"}
          pending={pending}
          onCancel={() => setOpen(false)}
          onSave={() =>
            start(async () => {
              const res = await upsertGalleryItem({
                id: editId,
                title: form.title,
                image: form.image,
                videoUrl: form.type === "VIDEO" ? (form.videoUrl || undefined) : undefined,
                category: form.category,
                type: form.type as "PHOTO" | "VIDEO",
                status: form.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
                sortOrder: form.sortOrder,
              });
              if (res.success) {
                toast.success(res.message);
                setOpen(false);
              } else toast.error(res.message);
            })
          }
        >
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="ambiance">Ambiance</option>
              <option value="restaurant">Restaurant</option>
              <option value="food">Food</option>
              <option value="drinks">Drinks</option>
              <option value="events">Events</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Media Type</Label>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="PHOTO">Photo</option>
              <option value="VIDEO">Video</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <ImageUploadField
              label={form.type === "VIDEO" ? "Cover / Poster Image" : "Image"}
              value={form.image}
              onChange={(image) => setForm({ ...form, image })}
            />
          </div>

          {form.type === "VIDEO" && (
            <div className="sm:col-span-2">
              <VideoUploadField
                label="Video File or Link"
                value={form.videoUrl}
                onChange={(videoUrl) => setForm({ ...form, videoUrl })}
              />
            </div>
          )}
        </FormShell>
      )}
    </div>
  );
}

export function TestimonialsManager({
  items,
}: {
  items: {
    id: string;
    name: string;
    role?: string | null;
    avatar?: string | null;
    content: string;
    rating: number;
    status: string;
    isFeatured: boolean;
  }[];
}) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [form, setForm] = useState({
    name: "",
    role: "",
    avatar: "",
    content: "",
    rating: 5,
    isFeatured: false,
    status: "PUBLISHED",
  });

  return (
    <div className="space-y-6">
      <DataTable
        rows={items}
        columns={[
          { key: "name", header: "Name", sortable: true },
          { key: "rating", header: "Rating", sortable: true },
          {
            key: "content",
            header: "Quote",
            render: (r) => <span className="line-clamp-2 max-w-xs">{r.content}</span>,
          },
          { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            key: "actions",
            header: "",
            render: (r) => (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditId(r.id);
                  setOpen(true);
                  setForm({
                    name: r.name,
                    role: r.role || "",
                    avatar: r.avatar || "",
                    content: r.content,
                    rating: r.rating,
                    isFeatured: r.isFeatured,
                    status: r.status,
                  });
                }}
              >
                Edit
              </Button>
            ),
          },
        ]}
        searchKeys={["name", "content"]}
        onBulkDelete={(ids) =>
          start(async () => {
            const res = await deleteTestimonials(ids);
            res.success ? toast.success(res.message) : toast.error(res.message);
          })
        }
        toolbar={
          <Button
            size="sm"
            onClick={() => {
              setEditId(undefined);
              setOpen(true);
              setForm({
                name: "",
                role: "",
                avatar: "",
                content: "",
                rating: 5,
                isFeatured: false,
                status: "PUBLISHED",
              });
            }}
          >
            Add Testimonial
          </Button>
        }
      />
      {open && (
        <FormShell
          title={editId ? "Edit Testimonial" : "New Testimonial"}
          pending={pending}
          onCancel={() => setOpen(false)}
          onSave={() =>
            start(async () => {
              const res = await upsertTestimonial({
                id: editId,
                name: form.name,
                role: form.role || null,
                avatar: form.avatar || null,
                content: form.content,
                rating: form.rating,
                isFeatured: form.isFeatured,
                status: form.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
              });
              if (res.success) {
                toast.success(res.message);
                setOpen(false);
              } else toast.error(res.message);
            })
          }
        >
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Content</Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>
          <ImageUploadField
              label="Avatar photo"
              value={form.avatar}
              onChange={(avatar) => setForm({ ...form, avatar })}
            />
        </FormShell>
      )}
    </div>
  );
}

export function TeamManager({
  items,
}: {
  items: {
    id: string;
    name: string;
    role: string;
    bio?: string | null;
    image?: string | null;
    status: string;
    sortOrder: number;
  }[];
}) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [form, setForm] = useState({
    name: "",
    role: "",
    bio: "",
    image: "",
    status: "PUBLISHED",
    sortOrder: 0,
  });

  return (
    <div className="space-y-6">
      <DataTable
        rows={items}
        columns={[
          { key: "name", header: "Name", sortable: true },
          { key: "role", header: "Role", sortable: true },
          { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            key: "actions",
            header: "",
            render: (r) => (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditId(r.id);
                  setOpen(true);
                  setForm({
                    name: r.name,
                    role: r.role,
                    bio: r.bio || "",
                    image: r.image || "",
                    status: r.status,
                    sortOrder: r.sortOrder,
                  });
                }}
              >
                Edit
              </Button>
            ),
          },
        ]}
        searchKeys={["name", "role"]}
        onBulkDelete={(ids) =>
          start(async () => {
            const res = await deleteTeamMembers(ids);
            res.success ? toast.success(res.message) : toast.error(res.message);
          })
        }
        toolbar={
          <Button
            size="sm"
            onClick={() => {
              setEditId(undefined);
              setOpen(true);
              setForm({
                name: "",
                role: "",
                bio: "",
                image: "",
                status: "PUBLISHED",
                sortOrder: 0,
              });
            }}
          >
            Add Member
          </Button>
        }
      />
      {open && (
        <FormShell
          title={editId ? "Edit Team Member" : "New Team Member"}
          pending={pending}
          onCancel={() => setOpen(false)}
          onSave={() =>
            start(async () => {
              const res = await upsertTeamMember({
                id: editId,
                name: form.name,
                role: form.role,
                bio: form.bio || null,
                image: form.image || null,
                status: form.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
                sortOrder: form.sortOrder,
              });
              if (res.success) {
                toast.success(res.message);
                setOpen(false);
              } else toast.error(res.message);
            })
          }
        >
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <ImageUploadField
              label="Photo"
              value={form.image}
              onChange={(image) => setForm({ ...form, image })}
            />
        </FormShell>
      )}
    </div>
  );
}

export function ContactsManager({
  items,
}: {
  items: {
    id: string;
    name: string;
    email: string;
    subject?: string | null;
    message: string;
    status: string;
    createdAt: string | Date;
  }[];
}) {
  const [pending, start] = useTransition();
  return (
    <DataTable
      rows={items}
      columns={[
        { key: "name", header: "Name", sortable: true },
        { key: "email", header: "Email", sortable: true },
        {
          key: "message",
          header: "Message",
          render: (r) => <span className="line-clamp-2 max-w-sm">{r.message}</span>,
        },
        { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
        {
          key: "actions",
          header: "",
          render: (r) => (
            <select
              className="rounded-md border border-border bg-background px-2 py-1 text-xs"
              value={r.status}
              disabled={pending}
              onChange={(e) =>
                start(async () => {
                  const res = await updateContactStatus(r.id, e.target.value);
                  res.success ? toast.success(res.message) : toast.error(res.message);
                })
              }
            >
              {["NEW", "READ", "REPLIED", "ARCHIVED"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          ),
        },
      ]}
      searchKeys={["name", "email", "message"]}
      onBulkDelete={(ids) =>
        start(async () => {
          const res = await deleteContacts(ids);
          res.success ? toast.success(res.message) : toast.error(res.message);
        })
      }
    />
  );
}

export function NewsletterManager({
  items,
}: {
  items: { id: string; email: string; isActive: boolean; createdAt: string | Date }[];
}) {
  const [pending, start] = useTransition();
  return (
    <DataTable
      rows={items}
      columns={[
        { key: "email", header: "Email", sortable: true },
        {
          key: "isActive",
          header: "Status",
          render: (r) => <StatusBadge status={r.isActive ? "ACTIVE" : "INACTIVE"} />,
        },
        {
          key: "createdAt",
          header: "Joined",
          render: (r) => new Date(r.createdAt).toLocaleDateString(),
        },
      ]}
      searchKeys={["email"]}
      onBulkDelete={(ids) =>
        start(async () => {
          const res = await deleteNewsletter(ids);
          res.success ? toast.success(res.message) : toast.error(res.message);
        })
      }
      toolbar={
        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await setNewsletterActive(
                items.map((i) => i.id),
                false
              );
              res.success ? toast.success(res.message) : toast.error(res.message);
            })
          }
        >
          Deactivate all
        </Button>
      }
    />
  );
}

export function BookingsManager({
  items,
}: {
  items: {
    id: string;
    name: string;
    email: string;
    phone: string;
    guests: number;
    status: string;
    event: { title: string };
    createdAt: string | Date;
  }[];
}) {
  const [pending, start] = useTransition();
  type Row = (typeof items)[number] & { eventTitle: string };
  const rows: Row[] = items.map((i) => ({ ...i, eventTitle: i.event.title }));

  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "eventTitle", header: "Event", sortable: true },
        { key: "name", header: "Guest", sortable: true },
        { key: "email", header: "Email" },
        { key: "guests", header: "Guests", sortable: true },
        { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
        {
          key: "actions",
          header: "",
          render: (r) => (
            <select
              className="rounded-md border border-border bg-background px-2 py-1 text-xs"
              value={r.status}
              disabled={pending}
              onChange={(e) =>
                start(async () => {
                  const res = await updateEventBookingStatus(r.id, e.target.value);
                  res.success ? toast.success(res.message) : toast.error(res.message);
                })
              }
            >
              {["PENDING", "CONFIRMED", "CANCELLED"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          ),
        },
      ]}
      searchKeys={["name", "email", "eventTitle"]}
      onBulkDelete={(ids) =>
        start(async () => {
          const res = await deleteEventBookings(ids);
          res.success ? toast.success(res.message) : toast.error(res.message);
        })
      }
    />
  );
}
