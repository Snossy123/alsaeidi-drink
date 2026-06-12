export const API_BASE_URL = "https://greensolar-power.com/POS-API/public/api"; // http://localhost:8000/api

export const IMAGE_BASE_URL = API_BASE_URL.replace("/public/api", "");

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