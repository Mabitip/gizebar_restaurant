"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
};

export async function uploadAdminImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Upload failed");
  const url = data.media?.url as string | undefined;
  if (!url) throw new Error("Upload returned no URL");
  return url;
}

/** Compact single-image uploader for team/avatar/category fields */
export function ImageUploadField({
  value,
  onChange,
  label = "Image",
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB");
      return;
    }
    startTransition(async () => {
      try {
        onChange(await uploadAdminImage(file));
        toast.success("Image uploaded");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      }
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border border-dashed border-border bg-surface/80 p-1.5 transition",
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
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <button
          type="button"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-background"
        >
          {value ? (
            <Image
              src={value}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
              unoptimized={value.startsWith("blob:") || value.startsWith("data:")}
            />
          ) : pending ? (
            <span className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </span>
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-muted">
              <ImagePlus className="h-4 w-4 text-primary" />
              <span className="text-[9px]">Add</span>
            </span>
          )}
        </button>
        <div className="flex flex-col gap-1 pr-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            {value ? "Replace" : "Upload"}
          </Button>
          {value && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-muted"
              disabled={pending}
              onClick={() => onChange("")}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Remove
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
