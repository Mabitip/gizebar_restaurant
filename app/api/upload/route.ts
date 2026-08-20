import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { isCloudinaryConfigured, uploadImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function detectImageMime(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return "image/gif";
  }
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
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
    default:
      return ".jpg";
  }
}

async function saveLocalUpload(buffer: Buffer, mime: string, originalName: string) {
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${extFromMime(mime)}`;
  await writeFile(path.join(dir, filename), buffer);
  return {
    url: `/uploads/${filename}`,
    filename: originalName,
    width: undefined as number | undefined,
    height: undefined as number | undefined,
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

    if (!file || file.size <= 0) {
      return NextResponse.json(
        { message: "Please choose an image file to upload." },
        { status: 400 }
      );
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ message: "Image must be under 8MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detected = detectImageMime(buffer);
    if (!detected || !ALLOWED_TYPES.has(detected)) {
      return NextResponse.json(
        { message: "Unsupported file type. Use PNG, JPG, WEBP, or GIF." },
        { status: 400 }
      );
    }

    if (file.type && file.type !== detected && !(file.type === "image/jpg" && detected === "image/jpeg")) {
      // Client MIME may lie; detected type wins. Reject SVG / mismatched executables already by magic bytes.
    }

    let url: string;
    let publicId: string | undefined;
    let width: number | undefined;
    let height: number | undefined;
    let filename = file.name;

    if (isCloudinaryConfigured()) {
      const uploaded = await uploadImage(buffer, "gize/media");
      url = uploaded.url;
      publicId = uploaded.publicId;
      width = uploaded.width;
      height = uploaded.height;
    } else {
      const local = await saveLocalUpload(buffer, detected, file.name);
      url = local.url;
      filename = local.filename;
      width = local.width;
      height = local.height;
    }

    try {
      const media = await prisma.media.create({
        data: {
          url,
          publicId,
          filename,
          width,
          height,
          mimeType: detected,
          size: file.size,
          folder: isCloudinaryConfigured() ? "gize/media" : "uploads",
        },
      });
      return NextResponse.json({ success: true, media });
    } catch {
      return NextResponse.json({ success: true, media: { url, filename } });
    }
  } catch (e) {
    console.error("Upload failed", e);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
