export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "https://greensolar-power.com/POS-API/public/api";

export const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "").replace(/\/public$/, "");

export function getProductImageUrl(imagePath?: string | null): string | null {
  if (!imagePath) return null;
  if (
    imagePath.startsWith("data:") ||
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }
  const base = IMAGE_BASE_URL.replace(/\/$/, "");
  const path = imagePath.replace(/^\//, "");
  return `${base}/${path}`;
}