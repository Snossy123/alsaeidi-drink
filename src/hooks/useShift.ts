import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { cacheShift, getCachedShift } from "@/lib/offline/syncQueue";
import type { Shift } from "@/types/shift";

export function useShift() {
  const { user } = useAuth();
  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCachedShift, setIsCachedShift] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const employeeId = user?.type === "employee" ? Number(user.id) : null;

  const refresh = useCallback(async () => {
    if (!employeeId) {
      setShift(null);
      setIsCachedShift(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await apiClient<{ shift: Shift | null }>("/shifts/current");
      setShift(data.shift);
      setIsCachedShift(false);
      await cacheShift(employeeId, data.shift);
    } catch {
      const cached = await getCachedShift(employeeId);
      setShift(cached);
      setIsCachedShift(!!cached);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      refresh();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [refresh]);

  const openShift = async (openingFloat: number, notes?: string) => {
    if (!navigator.onLine) {
      throw new Error("يتطلب اتصالاً بالإنترنت لفتح وردية جديدة");
    }

    const data = await apiClient<{ shift: Shift }>("/shifts/open", {
      method: "POST",
      body: JSON.stringify({ opening_float: openingFloat, notes }),
    });

    setShift(data.shift);
    setIsCachedShift(false);
    if (employeeId) {
      await cacheShift(employeeId, data.shift);
    }
    return data.shift;
  };

  const closeShift = async (actualCash: number, notes?: string) => {
    if (!shift) throw new Error("No open shift");

    if (!navigator.onLine) {
      throw new Error("يتطلب اتصالاً بالإنترنت لإغلاق الوردية");
    }

    const data = await apiClient<{ shift: Shift }>(`/shifts/${shift.id}/close`, {
      method: "POST",
      body: JSON.stringify({ actual_cash: actualCash, notes }),
    });

    setShift(null);
    setIsCachedShift(false);
    if (employeeId) {
      await cacheShift(employeeId, null);
    }
    return data;
  };

  return {
    shift,
    loading,
    refresh,
    openShift,
    closeShift,
    requiresShift: user?.type === "employee",
    isCachedShift,
    isOffline,
  };
}
