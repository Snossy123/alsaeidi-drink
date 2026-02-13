import { Barcode, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BarcodeScannerProps {
  barcode: string;
  setBarcode: (value: string) => void;
  handleBarcodeSubmit: (e: React.FormEvent) => void;
}

export const BarcodeScanner = ({ barcode, setBarcode, handleBarcodeSubmit }: BarcodeScannerProps) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-2 bg-slate-900 rounded-2xl lg:rounded-[2rem] p-3 lg:p-4 shadow-2xl relative overflow-hidden shrink-0">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex items-center gap-3 px-2 lg:px-4 shrink-0 border-l border-white/10 ml-2 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 p-2 lg:p-2.5 rounded-2xl shadow-inner">
            <Calculator className="w-5 h-5 text-blue-400" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-black text-white leading-tight">نقطة البيع</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">السوق المركزي</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleBarcodeSubmit} className="w-full flex-1 flex items-center gap-2 lg:gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl lg:rounded-2xl p-1.5 focus-within:border-blue-500/50 transition-all">
        <div className="flex items-center gap-2 pr-2 text-slate-400 group">
          <Barcode className="w-4 h-4 lg:w-5 lg:h-5 group-hover:text-blue-400 transition-colors" />
        </div>

        <Input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="امسح الباركود..."
          className="flex-1 font-bold text-sm h-10 lg:h-11 bg-transparent border-none text-white placeholder:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[1px]"
          autoFocus
        />

        <Button
          type="submit"
          size="sm"
          className="h-10 lg:h-11 px-4 lg:px-8 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-lg lg:rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all ml-1"
        >
          إضافة
        </Button>
      </form>
    </div>
  );
};
