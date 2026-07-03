import { AlertCircle, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getProductImageUrl } from "@/lib/constants";
import { getProductSizeOptions, ProductSize } from "@/lib/productSizes";
import { Product } from "@/hooks/useSalesData";
import { cn } from "@/lib/utils";

interface SizeSelectionDialogProps {
  showSizeDialog: boolean;
  setShowSizeDialog: (open: boolean) => void;
  selectedProduct: Product | null;
  handleSelectSize: (size: ProductSize) => void;
}

export const SizeSelectionDialog = ({
  showSizeDialog,
  setShowSizeDialog,
  selectedProduct,
  handleSelectSize,
}: SizeSelectionDialogProps) => {
  const sizeOptions = selectedProduct ? getProductSizeOptions(selectedProduct) : [];

  return (
    <Dialog open={showSizeDialog} onOpenChange={setShowSizeDialog}>
      <DialogContent
        className="max-w-md overflow-hidden text-center rounded-2xl p-0 border-none bg-white dark:bg-slate-900 shadow-2xl"
        dir="rtl"
      >
        <div className="bg-slate-900 p-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">تخصيص الحجم</DialogTitle>
            <p className="text-slate-400 font-bold text-xs mt-1">اختر المقاس المفضل للمنتج</p>
          </DialogHeader>
        </div>

        <div className="p-5">
          {selectedProduct && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3">
                {getProductImageUrl(selectedProduct.image) ? (
                  <div className="w-28 h-24 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 p-2 border border-slate-100 dark:border-slate-800">
                    <img
                      src={getProductImageUrl(selectedProduct.image)!}
                      alt={selectedProduct.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center">
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                )}
                <h2 className="font-black text-lg text-slate-800 dark:text-white">{selectedProduct.name}</h2>
              </div>

              {sizeOptions.length > 0 ? (
                <div
                  className={cn(
                    "grid gap-3",
                    sizeOptions.length === 1 && "grid-cols-1 max-w-[200px] mx-auto",
                    sizeOptions.length === 2 && "grid-cols-2",
                    sizeOptions.length === 3 && "grid-cols-3",
                  )}
                >
                  {sizeOptions.map((size) => (
                    <button
                      key={size.key}
                      type="button"
                      data-compact
                      onClick={() => handleSelectSize(size.key)}
                      className={cn(
                        "h-24 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 shadow-sm",
                        "transition-transform active:scale-95 hover:brightness-95",
                        size.bg,
                        size.border,
                      )}
                    >
                      <span className={cn("text-xs font-black uppercase tracking-wide", size.labelColor)}>
                        {size.label}
                      </span>
                      <span className={cn("text-lg font-black tabular-nums", size.priceColor)}>
                        {size.price} ج
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30 p-4 flex flex-col items-center gap-2">
                  <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  <p className="font-black text-sm text-amber-900 dark:text-amber-100">
                    لا توجد أحجام متاحة
                  </p>
                  <p className="text-xs font-bold text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
                    لم يتم تحديد أسعار الأحجام لهذا المنتج. يرجى تحديث المنتج من إدارة المنتجات.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
