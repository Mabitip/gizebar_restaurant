import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export type CloudinaryUploadResult = {
  url: string;
  publicId: string;
  format?: string;
  resourceType: "image" | "video" | "raw";
  width?: number;
  height?: number;
  duration?: number;
  bytes?: number;
};

/**
 * Upload an image buffer, base64 string, or remote URL to Cloudinary.
 */
export async function uploadImage(
  file: Buffer | string,
  folder = "gize/images",
  tags: string[] = ["gize", "image"]
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary credentials are not configured in environment variables.");
  }

  const payload =
    typeof file === "string"
      ? file
      : `data:image/jpeg;base64,${file.toString("base64")}`;

  const options: UploadApiOptions = {
    folder,
    resource_type: "image",
    transformation: [
      { quality: "auto:good", fetch_format: "auto" }
    ],
    tags,
  };

  const result: UploadApiResponse = await cloudinary.uploader.upload(payload, options);

  return {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    resourceType: "image",
    width: result.width,
    height: result.height,
    bytes: result.bytes,
  };
}

/**
 * Upload a video buffer, base64 string, or remote URL to Cloudinary.
 */
export async function uploadVideo(
  file: Buffer | string,
  folder = "gize/videos",
  tags: string[] = ["gize", "video"]
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary credentials are not configured in environment variables.");
  }

  // Use upload_stream or base64 data uri for video uploads
  let payload: string;
  if (typeof file === "string") {
    payload = file;
  } else {
    payload = `data:video/mp4;base64,${file.toString("base64")}`;
  }

  const options: UploadApiOptions = {
    folder,
    resource_type: "video",
    transformation: [
      { quality: "auto", fetch_format: "auto" }
    ],
    tags,
  };

  const result: UploadApiResponse = await cloudinary.uploader.upload(payload, options);

  return {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    resourceType: "video",
    width: result.width,
    height: result.height,
    duration: result.duration,
    bytes: result.bytes,
  };
}

/**
 * Delete a media asset from Cloudinary by public ID.
 */
export async function deleteMedia(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<boolean> {
  if (!isCloudinaryConfigured() || !publicId) return false;
  try {
    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return res.result === "ok";
  } catch (error) {
    console.error("Cloudinary delete failed:", error);
    return false;
  }
}

/**
 * Backward compatibility alias for deleteImage
 */
export const deleteImage = (publicId: string) => deleteMedia(publicId, "image");

/**
 * Helper to build optimized Cloudinary image URLs with custom dimensions and transformations
 */
export function getOptimizedImageUrl(
  publicIdOrUrl: string,
  options?: {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "limit" | "thumb" | "scale";
    quality?: "auto" | "auto:good" | "auto:best" | "auto:eco";
    format?: "auto" | "webp" | "jpg" | "png";
  }
): string {
  if (!publicIdOrUrl) return "";
  if (!publicIdOrUrl.includes("res.cloudinary.com") && !isCloudinaryConfigured()) {
    return publicIdOrUrl;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "dyf8tcuy6";

  // If it's already a full Cloudinary URL and no options, return it
  if (publicIdOrUrl.startsWith("http") && !options) {
    return publicIdOrUrl;
  }

  // Extract public ID if full URL was provided
  let publicId = publicIdOrUrl;
  if (publicIdOrUrl.includes("res.cloudinary.com")) {
    const parts = publicIdOrUrl.split("/upload/");
    if (parts.length > 1) {
      // Remove existing transformations if any
      const afterUpload = parts[1];
      const slashIndex = afterUpload.indexOf("/");
      if (afterUpload.startsWith("v") && /v\d+/.test(afterUpload.slice(0, slashIndex))) {
        publicId = afterUpload.slice(slashIndex + 1);
      } else if (afterUpload.includes("/")) {
        publicId = afterUpload.split("/").slice(1).join("/");
      } else {
        publicId = afterUpload;
      }
    }
  }

  const transforms: string[] = ["f_auto", "q_auto"];
  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);
  if (options?.crop) transforms.push(`c_${options.crop}`);

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms.join(",")}/${publicId}`;
}
