import { idbCount, idbDelete, idbGet, idbGetAll, idbPut } from "./db";

type SyncListener = (pendingCount: number) => void;
const listeners = new Set<SyncListener>();

async function notifyListeners() {
  const count = await getPendingCount();
  listeners.forEach((listener) => listener(count));
}

export function onSyncQueueChange(listener: SyncListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function enqueueSale(payload: Record<string, unknown>, clientId: string) {
  await idbPut("pendingSales", {
    id: clientId,
    payload: { ...payload, client_id: clientId },
    createdAt: new Date().toISOString(),
  });
  await notifyListeners();
}

export async function getPendingSales() {
  return idbGetAll<{
    id: string;
    payload: Record<string, unknown>;
    createdAt: string;
  }>("pendingSales");
}

export async function removePendingSale(id: string) {
  await idbDelete("pendingSales", id);
  await notifyListeners();
}

export async function getPendingCount() {
  return idbCount("pendingSales");
}

export async function cacheProducts(products: unknown[]) {
  await idbPut("cachedProducts", { key: "all", value: products });
}

export async function getCachedProducts<T = unknown[]>(): Promise<T | null> {
  const row = await idbGet<{ key: string; value: T }>("cachedProducts", "all");
  return row?.value || null;
}

export async function cacheCategories(categories: unknown[]) {
  await idbPut("cachedCategories", { key: "all", value: categories });
}

export async function getCachedCategories<T = unknown[]>(): Promise<T | null> {
  const row = await idbGet<{ key: string; value: T }>("cachedCategories", "all");
  return row?.value || null;
}
