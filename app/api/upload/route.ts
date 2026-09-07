import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { isCloudinaryConfigured, uploadImage, uploadVideo } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/ogg",
]);

function detectMime(buffer: Buffer, originalType?: string): { mime: string; isVideo: boolean } | null {
  if (buffer.length < 8) return null;

  // Images
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", isVideo: false };
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { mime: "image/png", isVideo: false };
  }
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return { mime: "image/gif", isVideo: false };
  }
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { mime: "image/webp", isVideo: false };
  }

  // Videos
  // MP4 / QuickTime ftyp check
  if (buffer.length >= 12 && buffer.toString("ascii", 4, 8) === "ftyp") {
    return { mime: "video/mp4", isVideo: true };
  }
  // WebM / MKV EBML ID 1A 45 DF A3
  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return { mime: "video/webm", isVideo: true };
  }

  // Fallback to client declared type if valid
  if (originalType && ALLOWED_IMAGE_TYPES.has(originalType)) {
    return { mime: originalType, isVideo: false };
  }
  if (originalType && ALLOWED_VIDEO_TYPES.has(originalType)) {
    return { mime: originalType, isVideo: true };
  }

  return null;
}

function extFromMime(mime: string) {
  switch (mime) {
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/svg+xml":
      return ".svg";
    case "video/mp4":
    case "video/quicktime":
      return ".mp4";
    case "video/webm":
      return ".webm";
    default:
      return ".jpg";
  }
}

async function saveLocalUpload(buffer: Buffer, mime: string, originalName: string, isVideo: boolean) {
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${extFromMime(mime)}`;
  await writeFile(path.join(dir, filename), buffer);
  return {
    url: `/uploads/${filename}`,
    filename: originalName,
    publicId: undefined,
    width: undefined as number | undefined,
    height: undefined as number | undefined,
    duration: undefined as number | undefined,
    resourceType: isVideo ? ("video" as const) : ("image" as const),
  };
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !can(session, "media", "write")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const requestedFolder = (form.get("folder") as string) || "gize/media";

    if (!file || file.size <= 0) {
      return NextResponse.json(
        { message: "Please choose a media file to upload." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detected = detectMime(buffer, file.type);

    if (!detected) {
      return NextResponse.json(
        { message: "Unsupported file format. Please upload JPG, PNG, WEBP, GIF, SVG, MP4, or WebM." },
        { status: 400 }
      );
    }

    const { mime, isVideo } = detected;

    // Size limit: 15MB for images, 100MB for videos
    const maxSizeBytes = isVideo ? 100 * 1024 * 1024 : 15 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { message: `${isVideo ? "Video" : "Image"} exceeds maximum allowed size of ${isVideo ? "100MB" : "15MB"}.` },
        { status: 400 }
      );
    }

    let url: string;
    let publicId: string | undefined;
    let width: number | undefined;
    let height: number | undefined;
    let duration: number | undefined;
    let filename = file.name;
    const resourceType = isVideo ? "video" : "image";

    if (isCloudinaryConfigured()) {
      if (isVideo) {
        const uploadRes = await uploadVideo(buffer, requestedFolder || "gize/videos");
        url = uploadRes.url;
        publicId = uploadRes.publicId;
        width = uploadRes.width;
        height = uploadRes.height;
        duration = uploadRes.duration;
      } else {
        const uploadRes = await uploadImage(buffer, requestedFolder || "gize/images");
        url = uploadRes.url;
        publicId = uploadRes.publicId;
        width = uploadRes.width;
        height = uploadRes.height;
      }
    } else {
      const local = await saveLocalUpload(buffer, mime, file.name, isVideo);
      url = local.url;
      filename = local.filename;
    }

    let mediaRecord = null;
    try {
      mediaRecord = await prisma.media.create({
        data: {
          url,
          publicId,
          filename,
          width,
          height,
          mimeType: mime,
          size: file.size,
          folder: requestedFolder,
        },
      });
    } catch {
      mediaRecord = {
        id: randomUUID(),
        url,
        publicId,
        filename,
        width,
        height,
        mimeType: mime,
        size: file.size,
        folder: requestedFolder,
        createdAt: new Date(),
        updatedAt: new Date(),
        alt: null,
      };
    }

    return NextResponse.json({
      success: true,
      media: {
        id: mediaRecord?.id,
        url,
        publicId,
        filename,
        width,
        height,
        duration,
        mimeType: mime,
        resourceType,
        size: file.size,
      },
    });
  } catch (e) {
    console.error("Upload failed:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
