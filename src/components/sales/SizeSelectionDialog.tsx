import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getProductImageUrl } from "@/lib/constants";
import { Product } from "@/hooks/useSalesData";

interface SizeSelectionDialogProps {
  showSizeDialog: boolean;
  setShowSizeDialog: (open: boolean) => void;
  selectedProduct: Product | null;
  handleSelectSize: (size: "s" | "m" | "l") => void;
}

const SIZE_OPTIONS = [
  {
    key: "s" as const,
    label: "صغير (S)",
    priceKey: "s_price" as const,
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-300 dark:border-blue-700",
    labelColor: "text-blue-700 dark:text-blue-300",
    priceColor: "text-blue-900 dark:text-blue-100",
  },
  {
    key: "m" as const,
    label: "وسط (M)",
    priceKey: "m_price" as const,
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-300 dark:border-purple-700",
    labelColor: "text-purple-700 dark:text-purple-300",
    priceColor: "text-purple-900 dark:text-purple-100",
  },
  {
    key: "l" as const,
    label: "كبير (L)",
    priceKey: "l_price" as const,
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-300 dark:border-emerald-700",
    labelColor: "text-emerald-700 dark:text-emerald-300",
    priceColor: "text-emerald-900 dark:text-emerald-100",
  },
];

export const SizeSelectionDialog = ({
  showSizeDialog,
  setShowSizeDialog,
  selectedProduct,
  handleSelectSize,
}: SizeSelectionDialogProps) => {
  return (
    <Dialog open={showSizeDialog} onOpenChange={setShowSizeDialog}>
      <DialogContent
        className="max-w-lg overflow-hidden text-center rounded-2xl p-0 border-none bg-white dark:bg-slate-900 shadow-2xl"
        dir="rtl"
      >
        <div className="bg-slate-900 p-4 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">تخصيص الحجم</DialogTitle>
            <p className="text-slate-400 font-bold text-xs mt-1">اختر المقاس المفضل للمنتج</p>
          </DialogHeader>
        </div>

        <div className="p-4">
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                {getProductImageUrl(selectedProduct.image) ? (
                  <div className="w-32 h-24 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 p-2 border border-slate-100 dark:border-slate-800">
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

              <div className="grid grid-cols-3 gap-2">
                {SIZE_OPTIONS.map((size) => {
                  const price = selectedProduct[size.priceKey];
                  if (!price || price <= 0) return null;

                  return (
                    <Button
                      key={size.key}
                      data-compact
                      onClick={() => handleSelectSize(size.key)}
                      className={`h-20 flex flex-col items-center justify-center gap-1 rounded-xl border-2 ${size.bg} ${size.border} shadow-sm active:scale-95 transition-transform`}
                    >
                      <span className={`text-xs font-black uppercase tracking-wide ${size.labelColor}`}>
                        {size.label}
                      </span>
                      <span className={`text-lg font-black ${size.priceColor}`}>
                        {price} ج
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
