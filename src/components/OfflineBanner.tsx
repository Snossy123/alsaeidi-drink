import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineBanner() {
  const { online, pendingCount } = useOnlineStatus();

  if (online && pendingCount === 0) {
    return null;
  }

  return (
    <div className={`px-4 py-2 text-sm font-bold flex items-center gap-2 ${online ? "bg-amber-500/10 text-amber-700" : "bg-red-500/10 text-red-700"}`}>
      <WifiOff className="w-4 h-4" />
      {!online && <span>وضع أوفلاين — المبيعات تُحفظ محلياً</span>}
      {pendingCount > 0 && <span>{pendingCount} فاتورة بانتظار المزامنة</span>}
    </div>
  );
}
