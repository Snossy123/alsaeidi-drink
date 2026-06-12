import { Barcode, Calculator, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

interface BarcodeScannerProps {
  barcode: string;
  setBarcode: (value: string) => void;
  handleBarcodeSubmit: (e: React.FormEvent) => void;
  onOpenNav?: () => void;
}

export const BarcodeScanner = ({ barcode, setBarcode, handleBarcodeSubmit, onOpenNav }: BarcodeScannerProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col md:flex-row items-center gap-2 bg-slate-900 rounded-xl p-2 shadow-xl relative overflow-hidden shrink-0">
      <div className="flex items-center gap-2 px-2 shrink-0 border-l border-white/10 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2">
          {onOpenNav && (
            <button
              type="button"
              onClick={onOpenNav}
              className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
              aria-label="فتح القائمة"
            >
              <Menu className="w-4 h-4 text-white" />
            </button>
          )}
          <div className="bg-blue-600/20 p-1.5 rounded-lg">
            <Calculator className="w-4 h-4 text-blue-400" />
          </div>
          <h1 className="text-sm font-black text-white leading-tight">نقطة البيع</h1>
        </div>
      </div>

      <form onSubmit={handleBarcodeSubmit} className="w-full flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1 focus-within:border-blue-500/50 transition-all">
        <div className="flex items-center gap-2 pr-2 text-slate-400">
          <Barcode className="w-4 h-4" />
        </div>

        <Input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="باركود..."
          className="flex-1 font-bold text-xs h-8 bg-transparent border-none text-white placeholder:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[1px]"
          autoFocus={!isMobile}
        />

        <Button
          type="submit"
          size="sm"
          className="h-8 px-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] rounded-md shadow-lg shadow-blue-600/20 active:scale-95 transition-all ml-1"
        >
          إضافة
        </Button>
      </form>
    </div>
  );
};
