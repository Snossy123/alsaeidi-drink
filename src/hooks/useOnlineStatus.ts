import { useEffect, useState } from "react";
import { getPendingCount, onSyncQueueChange } from "@/lib/offline/syncQueue";
import { startSyncManager } from "@/lib/offline/syncManager";

export function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const refreshPending = async () => setPendingCount(await getPendingCount());
    refreshPending();

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const unsubscribeQueue = onSyncQueueChange(setPendingCount);
    const stopSync = startSyncManager();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsubscribeQueue();
      stopSync();
    };
  }, []);

  return { online, pendingCount };
}
