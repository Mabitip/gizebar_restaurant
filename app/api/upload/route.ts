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
  "image/svg+xml",
]);

function extFromFile(file: File) {
  const fromName = path.extname(file.name).toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  switch (file.type) {
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/svg+xml":
      return ".svg";
    default:
      return ".jpg";
  }
}

async function saveLocalUpload(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${extFromFile(file)}`;
  await writeFile(path.join(dir, filename), buffer);
  return {
    url: `/uploads/${filename}`,
    filename: file.name,
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
      return NextResponse.json({ message: "Please choose an image file to upload." }, { status: 400 });
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ message: "Image must be under 8MB." }, { status: 400 });
    }

    if (file.type && !ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { message: "Unsupported file type. Use PNG, JPG, WEBP, or GIF." },
        { status: 400 }
      );
    }

    let url: string;
    let publicId: string | undefined;
    let width: number | undefined;
    let height: number | undefined;
    let filename = file.name;

    if (isCloudinaryConfigured()) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await uploadImage(buffer, "gize/media");
      url = uploaded.url;
      publicId = uploaded.publicId;
      width = uploaded.width;
      height = uploaded.height;
    } else {
      const local = await saveLocalUpload(file);
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
          mimeType: file.type || null,
          size: file.size,
          folder: isCloudinaryConfigured() ? "gize/media" : "uploads",
        },
      });
      return NextResponse.json({ success: true, media });
    } catch {
      return NextResponse.json({ success: true, media: { url, filename } });
    }
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
