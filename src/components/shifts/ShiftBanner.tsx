import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Shift } from "@/types/shift";

interface ShiftBannerProps {
  shift: Shift;
  onCloseClick: () => void;
}

export function ShiftBanner({ shift, onCloseClick }: ShiftBannerProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 bg-emerald-600/10 border border-emerald-500/20 rounded-xl text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="font-bold truncate">
          وردية مفتوحة منذ {new Date(shift.opened_at).toLocaleTimeString("ar-EG")}
        </span>
      </div>
      <Button size="sm" variant="outline" onClick={onCloseClick} className="shrink-0 h-8">
        إغلاق الوردية
      </Button>
    </div>
  );
}
