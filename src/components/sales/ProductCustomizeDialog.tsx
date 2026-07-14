import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getProductImageUrl } from "@/lib/constants";
import { getProductSizeOptions, getProductSizePrice, ProductSize } from "@/lib/productSizes";
import { Product } from "@/hooks/useSalesData";
import type { CartModifier } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

export type ProductModifierOption = {
  id: number;
  name: string;
  price: number;
};

interface ProductCustomizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onConfirm: (payload: {
    size: ProductSize | null;
    basePrice: number;
    modifiers: CartModifier[];
  }) => void;
}

export const ProductCustomizeDialog = ({
  open,
  onOpenChange,
  product,
  onConfirm,
}: ProductCustomizeDialogProps) => {
  const sizeOptions = product ? getProductSizeOptions(product) : [];
  const modifiers = (product?.modifiers ?? []) as ProductModifierOption[];

  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [selectedModifierIds, setSelectedModifierIds] = useState<number[]>([]);

  useEffect(() => {
    if (!open || !product) return;
    setSelectedModifierIds([]);
    if (sizeOptions.length === 1) {
      setSelectedSize(sizeOptions[0].key);
    } else if (sizeOptions.length > 1) {
      setSelectedSize(null);
    } else {
      setSelectedSize(null);
    }
  }, [open, product?.id]);

  const basePrice = useMemo(() => {
    if (!product) return 0;
    if (selectedSize) return getProductSizePrice(product, selectedSize) || 0;
    if (sizeOptions.length === 0) return Number(product.price ?? 0);
    return 0;
  }, [product, selectedSize, sizeOptions.length]);

  const selectedModifiers = useMemo(
    () =>
      modifiers
        .filter((m) => selectedModifierIds.includes(Number(m.id)))
        .map((m) => ({ id: Number(m.id), name: m.name, price: Number(m.price || 0) })),
    [modifiers, selectedModifierIds]
  );

  const modifiersTotal = selectedModifiers.reduce((sum, m) => sum + m.price, 0);
  const lineTotal = Number((basePrice + modifiersTotal).toFixed(2));

  const needsSize = sizeOptions.length > 0;
  const canConfirm = !!product && (!needsSize || !!selectedSize) && basePrice > 0;

  const toggleModifier = (id: number) => {
    setSelectedModifierIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    if (!canConfirm || !product) return;
    onConfirm({
      size: selectedSize,
      basePrice,
      modifiers: selectedModifiers,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-hidden text-center rounded-2xl p-0 border-none bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
        dir="rtl"
      >
        <div className="bg-slate-900 p-5 text-white shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">تخصيص المنتج</DialogTitle>
            <p className="text-slate-400 font-bold text-xs mt-1">
              {needsSize ? "اختر الحجم والإضافات" : "اختر الإضافات المطلوبة"}
            </p>
          </DialogHeader>
        </div>

        <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-5">
          {product && (
            <>
              <div className="flex flex-col items-center gap-3">
                {getProductImageUrl(product.image) ? (
                  <div className="w-28 h-24 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 p-2 border border-slate-100 dark:border-slate-800">
                    <img
                      src={getProductImageUrl(product.image)!}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center">
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                )}
                <h2 className="font-black text-lg text-slate-800 dark:text-white">{product.name}</h2>
              </div>

              {needsSize && (
                <div className="space-y-2 text-right">
                  <p className="text-xs font-black text-slate-500">الحجم</p>
                  {sizeOptions.length > 0 ? (
                    <div
                      className={cn(
                        "grid gap-3",
                        sizeOptions.length === 1 && "grid-cols-1 max-w-[200px] mx-auto",
                        sizeOptions.length === 2 && "grid-cols-2",
                        sizeOptions.length === 3 && "grid-cols-3"
                      )}
                    >
                      {sizeOptions.map((size) => {
                        const selected = selectedSize === size.key;
                        return (
                          <button
                            key={size.key}
                            type="button"
                            data-compact
                            onClick={() => setSelectedSize(size.key)}
                            className={cn(
                              "h-20 flex flex-col items-center justify-center gap-1 rounded-xl border-2 shadow-sm",
                              "transition-transform active:scale-95",
                              size.bg,
                              selected ? "ring-2 ring-blue-600 border-blue-600" : size.border
                            )}
                          >
                            <span className={cn("text-xs font-black uppercase tracking-wide", size.labelColor)}>
                              {size.label}
                            </span>
                            <span className={cn("text-base font-black tabular-nums", size.priceColor)}>
                              {size.price} ج
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-amber-600" />
                      <p className="font-black text-sm text-amber-900">لا توجد أحجام متاحة</p>
                    </div>
                  )}
                </div>
              )}

              {modifiers.length > 0 && (
                <div className="space-y-2 text-right">
                  <p className="text-xs font-black text-slate-500">إضافات / تفاصيل</p>
                  <div className="grid grid-cols-2 gap-2">
                    {modifiers.map((mod) => {
                      const id = Number(mod.id);
                      const selected = selectedModifierIds.includes(id);
                      const price = Number(mod.price || 0);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleModifier(id)}
                          className={cn(
                            "min-h-[56px] rounded-xl border-2 px-3 py-2 text-sm font-black transition-all active:scale-[0.97]",
                            selected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                          )}
                        >
                          <span className="block leading-tight">{mod.name}</span>
                          <span
                            className={cn(
                              "block text-[11px] mt-0.5 tabular-nums",
                              selected ? "text-blue-100" : "text-slate-400"
                            )}
                          >
                            {price > 0 ? `+${price.toFixed(0)} ج` : "مجاني"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 p-4 space-y-2">
          <div className="flex items-center justify-between text-sm font-black text-slate-700 dark:text-slate-200 px-1">
            <span>الإجمالي</span>
            <span className="tabular-nums text-blue-600">{lineTotal.toFixed(2)} ج.م</span>
          </div>
          <Button
            type="button"
            disabled={!canConfirm}
            onClick={handleConfirm}
            className="w-full h-12 rounded-xl font-black text-base"
          >
            إضافة للسلة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
