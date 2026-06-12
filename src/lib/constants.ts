export const API_BASE_URL = "https://greensolar-power.com/POS-API/public/api"; // http://localhost:8000/api

export const IMAGE_BASE_URL = API_BASE_URL.replace("/public/api", "");

export function getProductImageUrl(imagePath?: string | null): string | null {
  if (!imagePath) return null;
  return `${IMAGE_BASE_URL}/${imagePath}`;
}