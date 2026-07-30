"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { uploadAdminImage } from "@/components/admin/image-upload-field";

type Props = {
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  max?: number;
  className?: string;
};

export function MultiImageUploadField({
  values,
  onChange,
  label = "Images",
  max = 8,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [dragOver, setDragOver] = useState(false);

  const remaining = Math.max(0, max - values.length);

  const uploadFiles = (fileList: FileList | File[] | null | undefined) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) {
      toast.error("Please choose image files");
      return;
    }
    if (files.length > remaining) {
      toast.error(`You can add up to ${remaining} more image${remaining === 1 ? "" : "s"}`);
    }
    const batch = files.slice(0, remaining);
    if (!batch.length) return;

    startTransition(async () => {
      const uploaded: string[] = [];
      for (const file of batch) {
        if (file.size > 8 * 1024 * 1024) {
          toast.error(`${file.name} is over 8MB`);
          continue;
        }
        try {
          uploaded.push(await uploadAdminImage(file));
        } catch (e) {
          toast.error(e instanceof Error ? e.message : `Failed: ${file.name}`);
        }
      }
      if (uploaded.length) {
        onChange([...values, ...uploaded]);
        toast.success(
          uploaded.length === 1 ? "Image uploaded" : `${uploaded.length} images uploaded`
        );
      }
    });
  };

  const removeAt = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const setCover = (index: number) => {
    if (index === 0) return;
    const next = [...values];
    const [picked] = next.splice(index, 1);
    if (picked) onChange([picked, ...next]);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <span className="text-[11px] text-muted">
          {values.length}/{max} · first is cover
        </span>
      </div>

      <div
        className={cn(
          "rounded-xl border border-dashed border-border bg-surface/80 p-2.5 transition",
          dragOver && "border-primary bg-primary/5"
        )}
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
        <div className="flex flex-wrap gap-2">
          {values.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-background shadow-sm"
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
                unoptimized={url.startsWith("blob:") || url.startsWith("data:")}
              />
              {index === 0 && (
                <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
                  Cover
                </span>
              )}
              <div className="absolute inset-0 flex items-end justify-center gap-1 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                {index !== 0 && (
                  <button
                    type="button"
                    className="rounded bg-white/95 p-1 text-black"
                    title="Set as cover"
                    onClick={() => setCover(index)}
                  >
                    <Star className="h-3 w-3" />
                  </button>
                )}
                <button
                  type="button"
                  className="rounded bg-white/95 p-1 text-primary"
                  title="Remove"
                  onClick={() => removeAt(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}

          {remaining > 0 && (
            <button
              type="button"
              disabled={pending}
              onClick={() => inputRef.current?.click()}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-background text-muted transition hover:border-primary hover:text-primary"
            >
              {pending ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
              <span className="text-[10px] font-medium">{pending ? "…" : "Add"}</span>
            </button>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending || remaining <= 0}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            {pending ? "Uploading…" : "Upload images"}
          </Button>
          <span className="text-[11px] text-muted">Drag & drop or select multiple</span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          uploadFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
