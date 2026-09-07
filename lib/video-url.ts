const VIDEO_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
  "youtu.be",
  "player.vimeo.com",
  "vimeo.com",
  "www.vimeo.com",
  "res.cloudinary.com",
]);

/** Check if a given URL is a direct playable video URL (e.g. Cloudinary, MP4, WebM) */
export function isDirectVideoUrl(raw: string | null | undefined): boolean {
  if (!raw?.trim()) return false;
  const str = raw.trim().toLowerCase();
  return (
    (str.includes("res.cloudinary.com") && (str.includes("/video/upload/") || str.endsWith(".mp4") || str.endsWith(".webm") || str.endsWith(".mov"))) ||
    str.endsWith(".mp4") ||
    str.endsWith(".webm") ||
    str.endsWith(".mov") ||
    str.endsWith(".m4v")
  );
}

/** Check if a URL is from YouTube or Vimeo */
export function isEmbedVideoUrl(raw: string | null | undefined): boolean {
  if (!raw?.trim()) return false;
  const str = raw.trim().toLowerCase();
  return str.includes("youtube") || str.includes("youtu.be") || str.includes("vimeo");
}

/** Returns a safe embeddable or direct playable https URL or null. */
export function sanitizeVideoEmbedUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;

    // Cloudinary video URLs
    if (url.hostname.toLowerCase() === "res.cloudinary.com" || isDirectVideoUrl(raw)) {
      return url.toString();
    }

    if (!VIDEO_HOSTS.has(url.hostname.toLowerCase())) return null;

    if (url.hostname === "youtu.be") {
      const id = url.pathname.replace(/^\//, "").split("/")[0];
      if (!id) return null;
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (url.hostname.includes("youtube") && url.pathname.startsWith("/watch")) {
      const id = url.searchParams.get("v");
      if (!id) return null;
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (url.hostname.includes("youtube") && url.pathname.startsWith("/embed/")) {
      return `https://www.youtube-nocookie.com${url.pathname}`;
    }
    if (url.hostname.includes("vimeo")) {
      const match = url.pathname.match(/\/(?:video\/)?(\d+)/);
      if (match?.[1]) return `https://player.vimeo.com/video/${match[1]}`;
      if (url.hostname === "player.vimeo.com") return url.toString();
    }
    return null;
  } catch {
    return null;
  }
}
