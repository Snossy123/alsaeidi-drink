import { apiClient } from "@/lib/apiClient";
import { getPendingSales, removePendingSale } from "./syncQueue";

export async function processSyncQueue() {
  const pending = await getPendingSales();

  for (const item of pending) {
    try {
      await apiClient("/sales-invoices", {
        method: "POST",
        headers: {
          "X-Client-Id": item.id,
        },
        body: JSON.stringify(item.payload),
      });
      await removePendingSale(item.id);
    } catch {
      break;
    }
  }
}

export function startSyncManager() {
  const run = () => {
    if (navigator.onLine) {
      processSyncQueue().catch(() => undefined);
    }
  };

  window.addEventListener("online", run);
  run();

  return () => window.removeEventListener("online", run);
}
