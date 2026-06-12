import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import type { Shift } from "@/types/shift";

export function useShift() {
  const { user } = useAuth();
  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (user?.type !== "employee") {
      setShift(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiClient<{ shift: Shift | null }>("/shifts/current");
      setShift(data.shift);
    } catch {
      setShift(null);
    } finally {
      setLoading(false);
    }
  }, [user?.type]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openShift = async (openingFloat: number, notes?: string) => {
    const data = await apiClient<{ shift: Shift }>("/shifts/open", {
      method: "POST",
      body: JSON.stringify({ opening_float: openingFloat, notes }),
    });
    setShift(data.shift);
    return data.shift;
  };

  const closeShift = async (actualCash: number, notes?: string) => {
    if (!shift) throw new Error("No open shift");
    const data = await apiClient<{ shift: Shift }>(`/shifts/${shift.id}/close`, {
      method: "POST",
      body: JSON.stringify({ actual_cash: actualCash, notes }),
    });
    setShift(null);
    return data;
  };

  return {
    shift,
    loading,
    refresh,
    openShift,
    closeShift,
    requiresShift: user?.type === "employee",
  };
}
