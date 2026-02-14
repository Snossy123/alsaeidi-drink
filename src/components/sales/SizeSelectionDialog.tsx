import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { API_BASE_URL } from "@/lib/constants";
import { Product } from "@/hooks/useSalesData";

// Derive image base URL from API_BASE_URL (removing /public/api)
const IMAGE_BASE_URL = API_BASE_URL.replace("/public/api", "");

interface SizeSelectionDialogProps {
  showSizeDialog: boolean;
  setShowSizeDialog: (open: boolean) => void;
  selectedProduct: Product | null;
  handleSelectSize: (size: "s" | "m" | "l") => void;
}

export const SizeSelectionDialog = ({
  showSizeDialog,
  setShowSizeDialog,
  selectedProduct,
  handleSelectSize,
}: SizeSelectionDialogProps) => {
  return (
    <Dialog open={showSizeDialog} onOpenChange={setShowSizeDialog}>
      <DialogContent className="max-w-2xl text-center rounded-[3rem] p-0 overflow-hidden border-none bg-white dark:bg-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.3)]" dir="rtl">
        <div className="bg-slate-900 p-8 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/30 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-3xl font-black tracking-tight">تخصيص الحجم</DialogTitle>
            <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest">اختر المقاس المفضل للمنتج</p>
          </DialogHeader>
        </div>

        <div className="p-8">
          {selectedProduct && (
            <div className="space-y-8">
              <div className="flex flex-col items-center gap-6">
                {selectedProduct.image ? (
                  <div className="w-64 h-48 rounded-[2rem] overflow-hidden shadow-2xl bg-slate-50 dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-800">
                    <img src={IMAGE_BASE_URL + "/" + selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-600/10 flex items-center justify-center">
                    <Package className="w-10 h-10 text-blue-600" />
                  </div>
                )}
                <h2 className="font-black text-2xl text-slate-800 dark:text-white tracking-tight">{selectedProduct.name}</h2>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-10">
                {selectedProduct.s_price > 0 && (
                  <Button
                    onClick={() => handleSelectSize("s")}
                    className="h-32 flex flex-col items-center justify-center gap-3 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-none hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-lg group active:scale-95"
                  >
                    <span className="text-xs font-black text-slate-400 group-hover:text-blue-100 uppercase tracking-widest">صغير (S)</span>
                    <span className="text-2xl font-black">{selectedProduct.s_price} ج</span>
                  </Button>
                )}
                {selectedProduct.m_price > 0 && (
                  <Button
                    onClick={() => handleSelectSize("m")}
                    className="h-32 flex flex-col items-center justify-center gap-3 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-none hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-lg group active:scale-95"
                  >
                    <span className="text-xs font-black text-slate-400 group-hover:text-purple-100 uppercase tracking-widest">وسط (M)</span>
                    <span className="text-2xl font-black">{selectedProduct.m_price} ج</span>
                  </Button>
                )}
                {selectedProduct.l_price > 0 && (
                  <Button
                    onClick={() => handleSelectSize("l")}
                    className="h-32 flex flex-col items-center justify-center gap-3 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-none hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-lg group active:scale-95"
                  >
                    <span className="text-xs font-black text-slate-400 group-hover:text-emerald-100 uppercase tracking-widest">كبير (L)</span>
                    <span className="text-2xl font-black">{selectedProduct.l_price} ج</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
