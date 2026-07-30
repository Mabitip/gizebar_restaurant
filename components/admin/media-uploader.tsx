"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MultiImageUploadField } from "@/components/admin/multi-image-upload-field";

export function MediaUploader() {
  const [urls, setUrls] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
      <MultiImageUploadField
        label="Upload to media library"
        values={urls}
        onChange={setUrls}
        max={20}
      />
      <p className="mt-3 text-sm text-muted">
        Files are saved as you upload. Select multiple images at once.
      </p>
      {urls.length > 0 && (
        <Button
          className="mt-4"
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(() => {
              setUrls([]);
              toast.success("Preview cleared");
            })
          }
        >
          Clear preview
        </Button>
      )}
    </div>
  );
}
