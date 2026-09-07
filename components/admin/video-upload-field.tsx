"use client";

import { useRef, useState, useTransition } from "react";
import { Film, Loader2, Play, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { isDirectVideoUrl } from "@/lib/video-url";

type Props = {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
};

export async function uploadAdminVideo(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", "gize/videos");

  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Video upload failed");
  const url = data.media?.url as string | undefined;
  if (!url) throw new Error("Upload returned no URL");
  return url;
}

export function VideoUploadField({
  value,
  onChange,
  label = "Video (Cloudinary / Direct Upload / URL)",
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [dragOver, setDragOver] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [urlInput, setUrlInput] = useState(value || "");

  const handleFile = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please choose a video file (MP4, WebM, MOV)");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video must be under 100MB");
      return;
    }

    startTransition(async () => {
      try {
        toast.info("Uploading video to Cloudinary…");
        const uploadedUrl = await uploadAdminVideo(file);
        onChange(uploadedUrl);
        setUrlInput(uploadedUrl);
        toast.success("Video uploaded to Cloudinary successfully!");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Video upload failed");
      }
    });
  };

  const isDirect = isDirectVideoUrl(value);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <button
          type="button"
          onClick={() => setManualMode(!manualMode)}
          className="text-xs text-primary underline-offset-4 hover:underline"
        >
          {manualMode ? "Switch to File Upload" : "Or Paste Video URL"}
        </button>
      </div>

      {manualMode ? (
        <div className="flex gap-2">
          <Input
            placeholder="Paste Cloudinary, MP4, YouTube, or Vimeo URL"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              onChange(e.target.value);
            }}
          />
          {value && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                setUrlInput("");
                onChange("");
              }}
              title="Clear video"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "rounded-xl border border-dashed border-border bg-surface/80 p-3 transition",
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
          {value ? (
            <div className="space-y-3">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
                {isDirect ? (
                  <video
                    src={value}
                    controls
                    className="h-full w-full object-contain"
                    preload="metadata"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center text-muted">
                    <Play className="h-8 w-8 text-primary" />
                    <p className="truncate text-xs text-foreground/80">{value}</p>
                    <span className="text-[10px] text-muted">External / Embed Video</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs text-muted">{value}</span>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => inputRef.current?.click()}
                  >
                    Replace Video
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    disabled={pending}
                    onClick={() => {
                      onChange("");
                      setUrlInput("");
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {pending ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Film className="h-6 w-6" />
                )}
              </div>
              <p className="text-sm font-medium">
                {pending ? "Uploading video to Cloudinary…" : "Upload video to Cloudinary"}
              </p>
              <p className="mt-1 text-xs text-muted">
                Supports MP4, WebM, MOV up to 100MB
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-3"
                disabled={pending}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                {pending ? "Processing…" : "Select Video File"}
              </Button>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}
