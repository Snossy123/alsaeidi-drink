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
  columns?: 2 | 3;
}

function OptionButtonGroup<T extends string>({
  value,
  onChange,
  options,
  columns = 2,
}: OptionButtonGroupProps<T>) {
  return (
    <div
      className={cn(
        "grid gap-2",
        columns === 3 ? "grid-cols-3" : "grid-cols-2"
      )}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 min-h-[52px] rounded-xl border-2 px-3 py-2.5 text-sm font-black transition-all active:scale-[0.97]",
              selected
                ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/25"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-blue-950/40"
            )}
          >
            {opt.icon && (
              <span className={cn("shrink-0", selected ? "text-white" : "text-slate-400")}>
                {opt.icon}
              </span>
            )}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function FieldSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-black text-slate-600 dark:text-slate-300 mr-1">
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
        className="max-w-md overflow-hidden overflow-x-hidden rounded-2xl border-none bg-white dark:bg-slate-900 shadow-2xl p-0 gap-0"
        dir="rtl"
      >
        <div className="bg-slate-900 p-5 text-white">
          <DialogHeader className="text-right space-y-1">
            <DialogTitle className="text-xl font-black tracking-tight">
              {editMode ? "حفظ تعديلات الفاتورة" : "تأكيد العملية"}
            </DialogTitle>
            <p className="text-slate-400 font-bold text-xs">
              {editMode ? editInvoiceNumber : "خطوات نهائية لإصدار الفاتورة"}
            </p>
          </DialogHeader>
          <div className="mt-4 rounded-xl bg-white/10 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-300">إجمالي الفاتورة</span>
            <span className="text-2xl font-black">{total.toFixed(2)} ج</span>
          </div>
        </div>

        <div className="p-5 space-y-5 max-h-[min(70vh,520px)] overflow-y-auto">
          {!editMode && (
            <FieldSection label="الموظف المسؤول">
              <div className="flex flex-wrap gap-2">
                {employees.map((emp) => {
                  const selected = selectedEmployee === emp.id.toString();
                  return (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => setSelectedEmployee(emp.id.toString())}
                      className={cn(
                        "inline-flex items-center gap-2 min-h-[48px] rounded-xl border-2 px-4 py-2.5 text-sm font-black transition-all active:scale-[0.97]",
                        selected
                          ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/25"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                      )}
                    >
                      <User className={cn("w-4 h-4 shrink-0", selected ? "text-white" : "text-slate-400")} />
                      {emp.name}
                    </button>
                  );
                })}
              </div>
            </FieldSection>
          )}

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

          {!editMode && (
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
          )}

          {!editMode && isPaid && (
            <>
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

              {paymentMethod === "cash" && (
                <FieldSection label="المبلغ المدفوع">
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
                    className="h-12 text-left text-lg font-black border-2 rounded-xl"
                  />
                  <div
                    className={cn(
                      "rounded-xl px-4 py-2.5 text-sm font-black text-center",
                      paid >= total
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                    )}
                  >
                    {paid >= total
                      ? `الباقي: ${change.toFixed(2)} ج`
                      : `المتبقي: ${remaining.toFixed(2)} ج`}
                  </div>
                </FieldSection>
              )}
            </>
          )}

          <FieldSection label="ملاحظات التحضير">
            <div className="relative">
              <Receipt className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="مثال: بدون سكر - زيادة ثلج..."
                value={kitchenNote}
                onChange={(e) => setKitchenNote(e.target.value)}
                className="h-12 pr-10 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
              />
            </div>
          </FieldSection>
        </div>

        <div className="p-5 pt-0">
          <Button
            data-compact
            onClick={() => handleCheckout(amountPaid)}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 font-black text-white text-sm shadow-lg shadow-blue-600/25"
          >
            {editMode
              ? `حفظ التعديلات (${total.toFixed(2)} ج)`
              : `إتمام البيع وطباعة الفاتورة (${total.toFixed(2)} ج)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
