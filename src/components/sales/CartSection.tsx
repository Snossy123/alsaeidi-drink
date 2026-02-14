import { ShoppingCart, Receipt, Trash2, Minus, Plus, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

import { CartItem } from "@/hooks/useCart";

interface CartSectionProps {
  cart: CartItem[];
  removeFromCart: (id: string | number, price: number) => void;
  updateQuantity: (id: string | number, newQuantity: number, price: number) => void;
  calculateTotal: () => number;
  openEmployeeDialog: () => void;
}

export const CartSection = ({
  cart,
  removeFromCart,
  updateQuantity,
  calculateTotal,
  openEmployeeDialog
}: CartSectionProps) => {
  return (
    <Card className="h-full flex flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/20 dark:border-slate-800 shadow-2xl rounded-[2.5rem] overflow-hidden relative z-10">

      {/* Cart Header */}
      <CardHeader className="py-4 lg:py-6 px-4 lg:px-6 border-b border-slate-100 dark:border-slate-800/50 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-0.5">
              <span className="text-sm font-black text-slate-800 dark:text-white">الفاتورة الحالية</span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{cart.length} أصناف في السلة</p>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Cart Items */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 gap-4 opacity-50">
            <div className="w-16 h-16 rounded-full border-4 border-dashed border-current flex items-center justify-center">
              <Receipt className="w-8 h-8" />
            </div>
            <p className="text-sm font-black italic">السلة فارغة حالياً</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={`${item.id}-${item.price}`}
              className="group bg-white/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1 min-w-0">
                  <h4 className="font-black text-sm text-slate-700 dark:text-slate-200 truncate leading-tight group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </h4>
                  {item.size && (
                    <Badge variant="outline" className="text-[9px] font-black h-4 px-1.5 border-blue-200 text-blue-600 bg-blue-50/50">
                      {item.size === 's' ? 'صغير' : item.size === 'm' ? 'وسط' : 'كبير'}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                  onClick={() => removeFromCart(item.id, item.price)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200/50 dark:border-slate-700/50">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-500"
                    onClick={() => updateQuantity(item.id, item.quantity - 1, item.price)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-xs font-black min-w-[20px] text-center text-slate-800 dark:text-white">
                    {item.quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-500"
                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.price)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>

                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">السعر</p>
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                    {(item.price * item.quantity).toFixed(2)} <span className="text-[10px]">ج</span>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>

      {/* Footer: Grand Total */}
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 bg-slate-900 dark:bg-black/40 relative overflow-hidden shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="flex justify-between items-end relative z-10">
          <div className="space-y-1">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">الإجمالي النهائي</span>
            <p className="text-[10px] text-blue-400 font-bold italic">شامل ضريبة القيمة المضافة</p>
          </div>
          <div className="text-left">
            <span className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-none block">
              {calculateTotal().toFixed(2)}
            </span>
            <span className="text-sm font-black text-blue-500 uppercase ml-1 tracking-widest mt-1 block">جنيه مصري</span>
          </div>
        </div>

        <div className="flex gap-3 relative z-10">
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 text-white shrink-0 active:scale-90 transition-all"
          >
            <Printer className="w-5 h-5" />
          </Button>
          <Button
            onClick={openEmployeeDialog}
            className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/20 font-black text-white tracking-wide active:scale-95 transition-all text-base"
          >
            إتمام العملية الآن
          </Button>
        </div>
      </div>
    </Card>
  );
};
