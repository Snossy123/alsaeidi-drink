import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Banknote,
  CreditCard,
  Receipt,
  ShoppingBag,
  User,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Employee } from "@/hooks/useSalesData";
import type { OrderType, PaymentMethod, PaymentStatus } from "@/types/salesInvoice";

interface CheckoutDialogProps {
  showEmployeeDialog: boolean;
  setShowEmployeeDialog: (open: boolean) => void;
  selectedEmployee: string;
  setSelectedEmployee: (value: string) => void;
  employees: Employee[];
  kitchenNote: string;
  setKitchenNote: (value: string) => void;
  orderType: OrderType;
  setOrderType: (value: OrderType) => void;
  paymentStatus: PaymentStatus;
  setPaymentStatus: (value: PaymentStatus) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (value: PaymentMethod) => void;
  total: number;
  handleCheckout: (cashAmountPaid: string) => void;
  editMode?: boolean;
  editInvoiceNumber?: string;
}

interface OptionButtonGroupProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon?: ReactNode }[];
}

function OptionButtonGroup<T extends string>({
  value,
  onChange,
  options,
}: OptionButtonGroupProps<T>) {
  return (
    <div className="flex rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden p-0.5 gap-0.5 bg-slate-50 dark:bg-slate-800/40">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 min-h-[44px] rounded-lg px-2 py-1.5 text-sm font-black transition-all active:scale-[0.98]",
              selected
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                : "text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-700/60"
            )}
          >
            {opt.icon && (
              <span className={cn("shrink-0 [&>svg]:w-4 [&>svg]:h-4", selected ? "text-white" : "text-slate-400")}>
                {opt.icon}
              </span>
            )}
            <span className="leading-tight">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function FieldSection({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs sm:text-sm font-black text-slate-600 dark:text-slate-300">
        {label}
      </Label>
      {children}
    </div>
  );
}

export const CheckoutDialog = ({
  showEmployeeDialog,
  setShowEmployeeDialog,
  selectedEmployee,
  setSelectedEmployee,
  employees,
  kitchenNote,
  setKitchenNote,
  orderType,
  setOrderType,
  paymentStatus,
  setPaymentStatus,
  paymentMethod,
  setPaymentMethod,
  total,
  handleCheckout,
  editMode = false,
  editInvoiceNumber,
}: CheckoutDialogProps) => {
  const [amountPaid, setAmountPaid] = useState("");
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (showEmployeeDialog && !wasOpenRef.current) {
      setAmountPaid(total.toFixed(2));
    }
    wasOpenRef.current = showEmployeeDialog;
  }, [showEmployeeDialog, total]);

  const paid = parseFloat(amountPaid) || 0;
  const change = Math.max(0, paid - total);
  const remaining = Math.max(0, total - paid);
  const isPaid = paymentStatus === "paid";

  return (
    <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
      <DialogContent
        className="!w-[min(96vw,760px)] !max-w-[760px] !p-0 !gap-0 !rounded-2xl !max-h-[90dvh] !overflow-hidden border-none bg-white dark:bg-slate-900 shadow-2xl"
        dir="rtl"
      >
        <div className="flex flex-row max-h-[85dvh] overflow-hidden">
          {/* Sidebar — title + total + submit (right in RTL) */}
          <div className="shrink-0 w-[160px] sm:w-[200px] bg-slate-900 text-white flex flex-col px-3 py-4 sm:px-4 sm:py-5 border-l border-slate-800">
            <DialogHeader className="text-right space-y-1">
              <DialogTitle className="text-sm sm:text-base font-black leading-snug">
                {editMode ? "حفظ تعديلات الفاتورة" : "تأكيد العملية"}
              </DialogTitle>
              <p className="text-slate-400 font-bold text-[10px] sm:text-xs leading-snug">
                {editMode ? editInvoiceNumber : "خطوات نهائية لإصدار الفاتورة"}
              </p>
            </DialogHeader>
            <div className="flex-1 min-h-[16px]" />
            <div className="rounded-xl bg-white/10 px-3 py-3 text-center space-y-1 mb-3">
              <span className="block text-[10px] sm:text-xs font-bold text-slate-400">إجمالي الفاتورة</span>
              <span className="block text-xl sm:text-2xl font-black leading-none">{total.toFixed(2)} ج</span>
            </div>
            <Button
              data-compact
              onClick={() => handleCheckout(amountPaid)}
              className="w-full h-auto min-h-[48px] py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-black text-white text-[10px] sm:text-xs leading-snug whitespace-normal shadow-lg shadow-blue-600/20"
            >
              {editMode
                ? `حفظ التعديلات`
                : `إتمام البيع`}
            </Button>
          </div>

          {/* Main — form */}
          <div className="flex-1 min-w-0 min-h-0 overflow-y-auto overscroll-y-contain px-4 py-3 sm:px-5 space-y-3">
            {!editMode && (
              <FieldSection label="الموظف المسؤول">
                <div className="flex gap-2">
                  {employees.map((emp) => {
                    const selected = selectedEmployee === emp.id.toString();
                    return (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => setSelectedEmployee(emp.id.toString())}
                        className={cn(
                          "flex flex-1 min-w-0 items-center justify-center gap-2 min-h-[48px] rounded-xl border-2 px-3 py-2 text-sm font-black transition-all active:scale-[0.97]",
                          selected
                            ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                        )}
                      >
                        <User className={cn("w-4 h-4 shrink-0", selected ? "text-white" : "text-slate-400")} />
                        <span className="break-words text-center leading-tight">{emp.name}</span>
                      </button>
                    );
                  })}
                </div>
              </FieldSection>
            )}

            {/* Order type + Payment status + Payment method — 3 columns */}
            {!editMode ? (
              <div
                className={cn(
                  "grid gap-3",
                  isPaid ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"
                )}
              >
                <FieldSection label="نوع الطلب">
                  <OptionButtonGroup
                    value={orderType}
                    onChange={(v) => setOrderType(v as OrderType)}
                    options={[
                      { value: "takeaway", label: "تيك اوي", icon: <ShoppingBag className="w-4 h-4" /> },
                      { value: "table", label: "طربيزة", icon: <UtensilsCrossed className="w-4 h-4" /> },
                    ]}
                  />
                </FieldSection>

                <FieldSection label="حالة الدفع">
                  <OptionButtonGroup
                    value={paymentStatus}
                    onChange={(v) => setPaymentStatus(v as PaymentStatus)}
                    options={[
                      { value: "paid", label: "مدفوع", icon: <Wallet className="w-4 h-4" /> },
                      { value: "unpaid", label: "غير مدفوع", icon: <CreditCard className="w-4 h-4" /> },
                    ]}
                  />
                </FieldSection>

                {isPaid && (
                  <FieldSection label="طريقة الدفع">
                    <OptionButtonGroup
                      value={paymentMethod}
                      onChange={(v) => setPaymentMethod(v as PaymentMethod)}
                      options={[
                        { value: "cash", label: "نقدي", icon: <Banknote className="w-4 h-4" /> },
                        { value: "card", label: "بطاقة", icon: <CreditCard className="w-4 h-4" /> },
                      ]}
                    />
                  </FieldSection>
                )}
              </div>
            ) : (
              <FieldSection label="نوع الطلب">
                <OptionButtonGroup
                  value={orderType}
                  onChange={(v) => setOrderType(v as OrderType)}
                  options={[
                    { value: "takeaway", label: "تيك اوي", icon: <ShoppingBag className="w-4 h-4" /> },
                    { value: "table", label: "طربيزة", icon: <UtensilsCrossed className="w-4 h-4" /> },
                  ]}
                />
              </FieldSection>
            )}

            {/* Cash amount + change — inline row */}
            {!editMode && isPaid && paymentMethod === "cash" && (
              <FieldSection label="المبلغ المدفوع">
                <div className="flex gap-2 items-stretch">
                  <Input
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    value={amountPaid}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setAmountPaid(value);
                      }
                    }}
                    className="h-10 flex-[3] min-w-0 text-left text-base font-black border-2 rounded-xl"
                  />
                  <div
                    className={cn(
                      "flex-[2] min-w-0 flex items-center justify-center rounded-xl px-3 text-sm font-black text-center",
                      paid >= total
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                    )}
                  >
                    {paid >= total
                      ? `الباقي: ${change.toFixed(2)} ج`
                      : `المتبقي: ${remaining.toFixed(2)} ج`}
                  </div>
                </div>
              </FieldSection>
            )}

            {!editMode && isPaid && paymentMethod === "card" && (
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-200 dark:border-slate-700 px-4 py-2.5 text-center">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  دفع بالبطاقة — {total.toFixed(2)} ج
                </p>
              </div>
            )}

            <FieldSection label="ملاحظات التحضير">
              <div className="relative">
                <Receipt className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="مثال: بدون سكر - زيادة ثلج..."
                  value={kitchenNote}
                  onChange={(e) => setKitchenNote(e.target.value)}
                  className="h-10 pr-10 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
                />
              </div>
            </FieldSection>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
