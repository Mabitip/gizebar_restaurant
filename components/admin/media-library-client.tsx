"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Loader2,
  Play,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteMediaItem } from "@/actions/admin";
import { isDirectVideoUrl } from "@/lib/video-url";

export type MediaItem = {
  id: string;
  url: string;
  publicId: string | null;
  filename: string | null;
  mimeType: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
  alt: string | null;
  folder: string | null;
  createdAt: Date | string;
};

export function MediaLibraryClient({ initialMedia }: { initialMedia: MediaItem[] }) {
  const [items, setItems] = useState<MediaItem[]>(initialMedia);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const isVideo =
        item.mimeType?.startsWith("video/") ||
        item.url.includes("/video/upload/") ||
        isDirectVideoUrl(item.url);

      if (filterType === "image" && isVideo) return false;
      if (filterType === "video" && !isVideo) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.filename?.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q) ||
        item.publicId?.toLowerCase().includes(q)
      );
    });
  }, [items, search, filterType]);

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Cloudinary URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this media from Cloudinary?")) {
      return;
    }
    startTransition(async () => {
      const res = await deleteMediaItem(id);
      if (res.success) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        if (previewItem?.id === id) setPreviewItem(null);
        toast.success("Media deleted from Cloudinary & Database");
      } else {
        toast.error(res.message || "Delete failed");
      }
    });
  };

  const uploadFiles = async (files: FileList | File[] | null) => {
    if (!files || !files.length) return;
    setIsUploading(true);
    const uploadedItems: MediaItem[] = [];

    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      const isVideo = file.type.startsWith("video/");
      form.append("folder", isVideo ? "gize/videos" : "gize/media");

      try {
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `Failed to upload ${file.name}`);

        if (data.media) {
          uploadedItems.unshift({
            id: data.media.id || `uploaded-${Date.now()}-${Math.random()}`,
            url: data.media.url,
            publicId: data.media.publicId || null,
            filename: data.media.filename || file.name,
            mimeType: data.media.mimeType || file.type,
            size: data.media.size || file.size,
            width: data.media.width || null,
            height: data.media.height || null,
            alt: null,
            folder: isVideo ? "gize/videos" : "gize/media",
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Failed to upload ${file.name}`);
      }
    }

    if (uploadedItems.length) {
      setItems((prev) => [...uploadedItems, ...prev]);
      toast.success(
        uploadedItems.length === 1
          ? "Uploaded to Cloudinary"
          : `${uploadedItems.length} files uploaded to Cloudinary`
      );
    }
    setIsUploading(false);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <div
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border bg-surface/50 hover:border-border/80"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          uploadFiles(e.dataTransfer.files);
        }}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
            {isUploading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : (
              <Upload className="h-7 w-7" />
            )}
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-foreground">
              {isUploading ? "Uploading to Cloudinary..." : "Upload Media to Cloudinary"}
            </h3>
            <p className="mt-1 text-xs text-muted">
              Drag & drop or select images (JPG, PNG, WEBP, GIF, SVG) and videos (MP4, WebM, MOV)
            </p>
          </div>
          <Button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="mt-2"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Uploading..." : "Select Files"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {(["all", "image", "video"] as const).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={filterType === t ? "primary" : "secondary"}
              onClick={() => setFilterType(t)}
              className="capitalize"
            >
              {t === "all" ? "All Media" : t === "image" ? "Images" : "Videos"}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <Input
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Media Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-border bg-background p-12 text-center text-muted">
          <ImageIcon className="mx-auto h-10 w-10 opacity-40" />
          <p className="mt-2 font-medium">No media found</p>
          <p className="text-xs">Upload images and videos above to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filteredItems.map((item) => {
            const isVideo =
              item.mimeType?.startsWith("video/") ||
              item.url.includes("/video/upload/") ||
              isDirectVideoUrl(item.url);

            return (
              <div
                key={item.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm transition hover:shadow-md"
              >
                {/* Thumbnail */}
                <div
                  className="relative aspect-square w-full cursor-pointer overflow-hidden bg-muted/40"
                  onClick={() => setPreviewItem(item)}
                >
                  {isVideo ? (
                    <div className="flex h-full w-full items-center justify-center bg-black/90 text-white">
                      <video
                        src={item.url}
                        className="h-full w-full object-cover opacity-60"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-md">
                          <Play className="h-5 w-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={item.url}
                      alt={item.filename || ""}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 20vw"
                      unoptimized={item.url.startsWith("blob:") || item.url.startsWith("data:")}
                    />
                  )}

                  {/* Badge */}
                  <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur-sm uppercase">
                    {isVideo ? "Video" : item.mimeType?.split("/")[1] || "Image"}
                  </span>
                </div>

                {/* Info & Actions */}
                <div className="flex flex-1 flex-col justify-between p-2.5">
                  <div>
                    <p className="truncate text-xs font-medium text-foreground" title={item.filename || item.url}>
                      {item.filename || "Cloudinary Asset"}
                    </p>
                    <p className="text-[10px] text-muted">
                      {formatFileSize(item.size)}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-1 border-t border-border pt-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      title="Copy Cloudinary URL"
                      onClick={() => copyUrl(item.url, item.id)}
                    >
                      {copiedId === item.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      title="Preview"
                      onClick={() => setPreviewItem(item)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      title="Delete from Cloudinary"
                      disabled={pending}
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Dialog Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full bg-muted/80 p-1.5 text-muted hover:text-foreground"
              onClick={() => setPreviewItem(null)}
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-heading text-lg font-semibold">
              {previewItem.filename || "Media Preview"}
            </h3>

            <div className="mt-4 flex max-h-[55vh] items-center justify-center overflow-hidden rounded-xl bg-black">
              {previewItem.mimeType?.startsWith("video/") ||
              previewItem.url.includes("/video/upload/") ||
              isDirectVideoUrl(previewItem.url) ? (
                <video
                  src={previewItem.url}
                  controls
                  autoPlay
                  className="max-h-[50vh] w-full object-contain"
                />
              ) : (
                <div className="relative h-[50vh] w-full">
                  <Image
                    src={previewItem.url}
                    alt={previewItem.filename || ""}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
              <div className="flex flex-wrap gap-4">
                <span>
                  <strong>Size:</strong> {formatFileSize(previewItem.size)}
                </span>
                {previewItem.width && previewItem.height && (
                  <span>
                    <strong>Dimensions:</strong> {previewItem.width} × {previewItem.height}
                  </span>
                )}
                <span>
                  <strong>Type:</strong> {previewItem.mimeType || "media"}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => copyUrl(previewItem.url, previewItem.id)}
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy Cloudinary URL
                </Button>
                <a
                  href={previewItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Open Direct URL
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
