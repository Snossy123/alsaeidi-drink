import { Clock, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Shift } from "@/types/shift";

interface ShiftBannerProps {
  shift: Shift;
  onCloseClick: () => void;
  isCached?: boolean;
  isOffline?: boolean;
}

export function ShiftBanner({ shift, onCloseClick, isCached, isOffline }: ShiftBannerProps) {
  const showOfflineHint = isOffline || isCached;

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 bg-emerald-600/10 border border-emerald-500/20 rounded-xl text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
        <div className="min-w-0">
          <span className="font-bold truncate block">
            وردية مفتوحة منذ {new Date(shift.opened_at).toLocaleTimeString("ar-EG")}
          </span>
          {showOfflineHint && (
            <span className="text-xs text-amber-700 flex items-center gap-1">
              <WifiOff className="w-3 h-3 shrink-0" />
              وردية محفوظة محلياً — أغلقها بعد عودة الإنترنت
            </span>
          )}
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onCloseClick}
        className="shrink-0 h-8"
        disabled={isOffline}
        title={isOffline ? "يتطلب اتصالاً بالإنترنت" : undefined}
      >
        إغلاق الوردية
      </Button>
    </div>
  );
}
