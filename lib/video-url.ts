const VIDEO_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
  "youtu.be",
  "player.vimeo.com",
  "vimeo.com",
  "www.vimeo.com",
]);

/** Returns a safe embeddable https URL or null. */
export function sanitizeVideoEmbedUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:") return null;
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
