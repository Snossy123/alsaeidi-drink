import { Barcode, FileText, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SystemLogo } from "@/components/SystemLogo";
import { useIsMobile } from "@/hooks/use-mobile";

interface BarcodeScannerProps {
  barcode: string;
  setBarcode: (value: string) => void;
  handleBarcodeSubmit: (e: React.FormEvent) => void;
  onOpenNav?: () => void;
  onOpenUnpaidInvoices?: () => void;
}

export const BarcodeScanner = ({
  barcode,
  setBarcode,
  handleBarcodeSubmit,
  onOpenNav,
  onOpenUnpaidInvoices,
}: BarcodeScannerProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col md:flex-row items-center gap-2 bg-slate-900 rounded-xl p-2 shadow-xl relative overflow-hidden shrink-0">
      <div className="flex items-center gap-2 px-2 shrink-0 border-l border-white/10 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2">
          {onOpenNav && (
            <button
              type="button"
              onClick={onOpenNav}
              className="h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
              aria-label="فتح القائمة"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          )}
          <SystemLogo variant="icon" className="h-8 w-8" imageClassName="h-7 w-7 rounded-lg" />
          <h1 className="text-lg font-black text-white leading-tight">نقطة البيع</h1>
        </div>

        {onOpenUnpaidInvoices && (
          <Button
            type="button"
            onClick={onOpenUnpaidInvoices}
            className="h-9 px-3 gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-sm shrink-0 md:mr-1"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">فواتير غير مدفوعة</span>
            <span className="sm:hidden">غير مدفوعة</span>
          </Button>
        )}
      </div>

      <form onSubmit={handleBarcodeSubmit} className="w-full flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1 focus-within:border-blue-500/50 transition-all">
        <div className="flex items-center gap-2 pr-2 text-slate-400">
          <Barcode className="w-4 h-4" />
        </div>

        <Input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="باركود..."
          className="flex-1 font-bold text-base h-10 bg-transparent border-none text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[1px]"
          autoFocus={!isMobile}
        />

        <Button
          type="submit"
          size="sm"
          className="h-10 px-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-base rounded-md shadow-lg shadow-blue-600/20 active:scale-95 transition-all ml-1"
        >
          إضافة
        </Button>
      </form>
    </div>
  );
};
