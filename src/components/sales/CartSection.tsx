import { ShoppingCart, Receipt, Trash2, Minus, Plus, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useScrollTouchGuard } from "@/hooks/useScrollTouchGuard";

import { CartItem, CartModifier } from "@/hooks/useCart";

interface CartSectionProps {
  cart: CartItem[];
  removeFromCart: (
    id: string | number,
    price: number,
    size?: "s" | "m" | "l" | null,
    modifiers?: CartModifier[]
  ) => void;
  updateQuantity: (
    id: string | number,
    newQuantity: number,
    price: number,
    size?: "s" | "m" | "l" | null,
    modifiers?: CartModifier[]
  ) => void;
  calculateTotal: () => number;
  openEmployeeDialog: () => void;
  editMode?: boolean;
}

export const CartSection = ({
  cart,
  removeFromCart,
  updateQuantity,
  calculateTotal,
  openEmployeeDialog,
  editMode = false,
}: CartSectionProps) => {
  const { onTouchStart, onTouchMove, onTouchEnd, guardAction } = useScrollTouchGuard();

  return (
    <Card className="h-full flex flex-col bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-lg rounded-xl overflow-hidden relative z-10">
      <CardHeader className="py-2 px-3 border-b border-slate-300 dark:border-slate-800/50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-base font-black text-slate-800 dark:text-white">
              {editMode ? "تعديل الفاتورة" : "الفاتورة الحالية"}
            </span>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-bold">{cart.length} أصناف في السلة</p>
          </div>
        </div>
      </CardHeader>

      <CardContent
        className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-hide min-h-0 touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-700 gap-2 opacity-70">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-base font-black italic">السلة فارغة حالياً</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={`${item.id}-${item.price}-${item.size ?? ""}-${(item.modifiers || []).map((m) => m.id).join(",")}`}
              className="bg-slate-200/80 dark:bg-slate-800/30 border border-slate-300 dark:border-slate-800/50 rounded-xl p-2"
            >
              <div className="flex justify-between items-start gap-1">
                <div className="min-w-0">
                  <h4 className="font-black text-base text-slate-800 dark:text-slate-200 leading-tight truncate">
                    {item.name}
                  </h4>
                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                    {item.size && (
                      <Badge
                        variant="outline"
                        className="text-xs font-black h-5 px-1.5 border-blue-300 text-blue-700 bg-blue-50/80"
                      >
                        {item.size === "s" ? "صغير" : item.size === "m" ? "وسط" : "كبير"}
                      </Badge>
                    )}
                    {(item.modifiers || []).map((mod) => (
                      <Badge
                        key={mod.id}
                        variant="outline"
                        className="text-xs font-black h-5 px-1.5 border-emerald-300 text-emerald-800 bg-emerald-50/80"
                      >
                        {mod.name}
                        {mod.price > 0 ? ` +${mod.price}` : ""}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  data-compact
                  className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-500 shrink-0 touch-manipulation"
                  onClick={guardAction(() =>
                    removeFromCart(item.id, item.price, item.size ?? null, item.modifiers || [])
                  )}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-900 rounded-lg p-0.5 border border-slate-300 dark:border-slate-700/50 touch-manipulation">
                  <Button
                    size="icon"
                    data-compact
                    variant="ghost"
                    className="h-7 w-7 rounded text-slate-600"
                    onClick={guardAction(() =>
                      updateQuantity(
                        item.id,
                        item.quantity - 1,
                        item.price,
                        item.size ?? null,
                        item.modifiers || []
                      )
                    )}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </Button>
                  <span className="text-base font-black min-w-[20px] text-center text-slate-800 dark:text-white">
                    {item.quantity}
                  </span>
                  <Button
                    size="icon"
                    data-compact
                    variant="ghost"
                    className="h-7 w-7 rounded text-slate-600"
                    onClick={guardAction(() =>
                      updateQuantity(
                        item.id,
                        item.quantity + 1,
                        item.price,
                        item.size ?? null,
                        item.modifiers || []
                      )
                    )}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="text-left">
                  <p className="text-xs font-bold text-slate-600 leading-none mb-0.5">السعر</p>
                  <span className="text-base font-black text-blue-700 dark:text-blue-400">
                    {(item.price * item.quantity).toFixed(2)} <span className="text-sm">ج</span>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <div className="p-3 space-y-2 bg-slate-900 dark:bg-black/40 shrink-0">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-sm font-black text-slate-400 uppercase tracking-wider">الإجمالي النهائي</span>
            <p className="text-xs text-blue-400 font-bold">شامل ضريبة القيمة المضافة</p>
          </div>
          <div className="text-left">
            <span className="text-3xl font-black text-white tracking-tight leading-none block">
              {calculateTotal().toFixed(2)}
            </span>
            <span className="text-sm font-black text-blue-500 mt-0.5 block">جنيه مصري</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            data-compact
            className="h-11 w-11 rounded-lg border-white/5 bg-white/5 hover:bg-white/10 text-white shrink-0"
          >
            <Printer className="w-4 h-4" />
          </Button>
          <Button
            data-compact
            onClick={openEmployeeDialog}
            className="flex-1 h-11 rounded-lg bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 font-black text-white active:scale-95 transition-all text-base"
          >
            {editMode ? "حفظ التعديلات" : "إتمام العملية الآن"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
