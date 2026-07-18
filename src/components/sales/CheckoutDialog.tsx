import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Banknote,
  CreditCard,
  MapPin,
  Phone,
  Receipt,
  ShoppingBag,
  Truck,
  User,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/apiClient";
import { Employee } from "@/hooks/useSalesData";
import type { OrderType, PaymentMethod, PaymentStatus } from "@/types/salesInvoice";
import { useToast } from "@/hooks/use-toast";

export interface DeliveryCustomerFields {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
}

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
  customerName: string;
  setCustomerName: (value: string) => void;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  customerAddress: string;
  setCustomerAddress: (value: string) => void;
  total: number;
  handleCheckout: (cashAmountPaid: string) => void;
  editMode?: boolean;
  editInvoiceNumber?: string;
}

interface OptionButtonGroupProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon?: ReactNode }[];
  columns?: number;
}

function OptionButtonGroup<T extends string>({
  value,
  onChange,
  options,
  columns,
}: OptionButtonGroupProps<T>) {
  const cols = columns ?? options.length;
  return (
    <div
      className={cn(
        "grid h-full min-h-[52px] w-full min-w-0 rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden p-0.5 gap-0.5 bg-slate-50 dark:bg-slate-800/40",
        cols === 3 ? "grid-cols-3" : cols === 2 ? "grid-cols-2" : "grid-cols-1"
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
              "flex items-center justify-center gap-1 min-w-0 min-h-[52px] h-full rounded-lg px-1 py-2 text-xs sm:text-sm font-black transition-all active:scale-[0.98]",
              selected
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                : "text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-700/60"
            )}
          >
            {opt.icon && (
              <span className={cn("shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4", selected ? "text-white" : "text-slate-400")}>
                {opt.icon}
              </span>
            )}
            <span className="leading-tight truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function FieldSection({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2 shrink-0">
        <Label className="text-xs sm:text-sm font-black text-slate-600 dark:text-slate-300">
          {label}
        </Label>
        {hint ? (
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500">{hint}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

const orderTypeOptions = [
  { value: "takeaway" as const, label: "تيك اوي", icon: <ShoppingBag className="w-4 h-4" /> },
  { value: "table" as const, label: "طربيزة", icon: <UtensilsCrossed className="w-4 h-4" /> },
  { value: "delivery" as const, label: "دليفري", icon: <Truck className="w-4 h-4" /> },
];

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
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  total,
  handleCheckout,
  editMode = false,
  editInvoiceNumber,
}: CheckoutDialogProps) => {
  const [amountPaid, setAmountPaid] = useState("");
  const wasOpenRef = useRef(false);
  const phoneLookupRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (showEmployeeDialog && !wasOpenRef.current) {
      setAmountPaid(total.toFixed(2));
    }
    wasOpenRef.current = showEmployeeDialog;
  }, [showEmployeeDialog, total]);

  useEffect(() => {
    if (orderType !== "delivery" || !showEmployeeDialog) return;
    const phone = customerPhone.replace(/\s+/g, "").trim();
    if (phone.length < 8) return;

    if (phoneLookupRef.current) clearTimeout(phoneLookupRef.current);
    phoneLookupRef.current = setTimeout(async () => {
      try {
        const data = await apiClient<{ status: string; customers: { name: string; phone: string; address_notes?: string | null }[] }>(
          `/customers?search=${encodeURIComponent(phone)}`
        );
        if (data.status !== "success") return;
        const match = data.customers.find(
          (c) => c.phone.replace(/\s+/g, "") === phone
        );
        if (!match) return;
        if (!customerName.trim()) setCustomerName(match.name);
        if (!customerAddress.trim() && match.address_notes) {
          setCustomerAddress(match.address_notes);
        }
      } catch {
        // ignore lookup errors during typing
      }
    }, 400);

    return () => {
      if (phoneLookupRef.current) clearTimeout(phoneLookupRef.current);
    };
  }, [customerPhone, orderType, showEmployeeDialog]); // eslint-disable-line react-hooks/exhaustive-deps

  const paid = parseFloat(amountPaid) || 0;
  const change = Math.max(0, paid - total);
  const remaining = Math.max(0, total - paid);
  const isPaid = paymentStatus === "paid";
  const isDelivery = orderType === "delivery";

  const confirmCheckout = () => {
    if (!editMode && isDelivery) {
      if (!customerName.trim() || !customerPhone.trim()) {
        toast({
          title: "بيانات الدليفري ناقصة",
          description: "أدخل اسم العميل ورقم التليفون",
          variant: "destructive",
        });
        return;
      }
    }
    handleCheckout(amountPaid);
  };

  return (
    <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
      <DialogContent
        className="!w-[min(98vw,1150px)] !max-w-[1150px] !p-0 !gap-0 !rounded-2xl !max-h-[90dvh] !overflow-hidden border-none bg-white dark:bg-slate-900 shadow-2xl"
        dir="rtl"
      >
        <div className="flex flex-row min-h-[400px] max-h-[90dvh] overflow-hidden">
          <div className="shrink-0 w-[160px] sm:w-[200px] bg-slate-900 text-white flex flex-col px-3 py-4 sm:px-4 sm:py-5 border-l border-slate-800">
            <DialogHeader className="text-right space-y-1 shrink-0">
              <DialogTitle className="text-sm sm:text-base font-black leading-snug">
                {editMode ? "حفظ تعديلات الفاتورة" : "تأكيد العملية"}
              </DialogTitle>
              <p className="text-slate-400 font-bold text-[10px] sm:text-xs leading-snug">
                {editMode ? editInvoiceNumber : "خطوات نهائية لإصدار الفاتورة"}
              </p>
            </DialogHeader>
            <div className="flex-1 flex flex-col justify-center min-h-[16px]">
              <div className="rounded-xl bg-white/10 px-3 py-3 text-center space-y-1">
                <span className="block text-[10px] sm:text-xs font-bold text-slate-400">إجمالي الفاتورة</span>
                <span className="block text-xl sm:text-2xl font-black leading-none">{total.toFixed(2)} ج</span>
              </div>
            </div>
            <Button
              data-compact
              onClick={confirmCheckout}
              className="w-full h-auto min-h-[48px] py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-black text-white text-[10px] sm:text-xs leading-snug whitespace-normal shadow-lg shadow-blue-600/20 shrink-0"
            >
              {editMode ? `حفظ التعديلات` : `إتمام البيع`}
            </Button>
          </div>

          <div className="flex-1 min-w-0 min-h-0 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-5 flex flex-col gap-4 h-full">
            {!editMode ? (
              <div
                className={cn(
                  "grid gap-3 flex-[1.2] min-h-0 content-stretch",
                  isPaid ? "grid-cols-1 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"
                )}
              >
                <FieldSection
                  label="نوع الطلب"
                  className={cn(
                    "flex flex-col min-h-0 h-full min-w-0 [&>:last-child]:flex-1",
                    "sm:col-span-2"
                  )}
                >
                  <OptionButtonGroup
                    value={orderType}
                    onChange={(v) => setOrderType(v as OrderType)}
                    options={orderTypeOptions}
                    columns={3}
                  />
                </FieldSection>

                <FieldSection label="حالة الدفع" className="flex flex-col min-h-0 h-full min-w-0 [&>:last-child]:flex-1">
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
                  <FieldSection label="طريقة الدفع" className="flex flex-col min-h-0 h-full min-w-0 [&>:last-child]:flex-1">
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
              <FieldSection label="نوع الطلب" className="flex flex-col flex-1 min-h-0 [&>:last-child]:flex-1">
                <OptionButtonGroup
                  value={orderType}
                  onChange={(v) => setOrderType(v as OrderType)}
                  options={orderTypeOptions}
                  columns={3}
                />
              </FieldSection>
            )}

            {!editMode && isDelivery && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0 rounded-xl border-2 border-amber-200/80 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                <FieldSection label="اسم العميل" hint="مطلوب">
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="اسم المستلم"
                      className="h-11 pr-10 border-2 rounded-xl font-bold text-sm"
                    />
                  </div>
                </FieldSection>
                <FieldSection label="رقم التليفون" hint="مطلوب">
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      dir="ltr"
                      className="h-11 pr-10 border-2 rounded-xl font-bold text-sm text-left"
                    />
                  </div>
                </FieldSection>
                <FieldSection label="ملاحظات العنوان" hint="اختياري">
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="الشارع، المعلم، الدور..."
                      className="h-11 pr-10 border-2 rounded-xl font-bold text-sm"
                    />
                  </div>
                </FieldSection>
              </div>
            )}

            {!editMode && isPaid && paymentMethod === "cash" && (
              <FieldSection label="المبلغ المدفوع" className="shrink-0">
                <div className="space-y-2">
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
                      className="h-14 flex-[3] min-w-0 text-left text-lg font-black border-2 rounded-xl"
                    />
                    <div
                      className={cn(
                        "flex-[2] min-w-0 flex items-center justify-center rounded-xl px-3 text-sm font-black text-center h-14",
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
                  <div className="grid grid-cols-5 gap-2">
                    {[20, 50, 100, 150, 200].map((amount) => {
                      const selected = paid === amount;
                      return (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setAmountPaid(amount.toFixed(2))}
                          className={cn(
                            "min-h-[44px] rounded-xl border-2 text-sm font-black transition-all active:scale-[0.97]",
                            selected
                              ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                          )}
                        >
                          {amount} ج
                        </button>
                      );
                    })}
                  </div>
                </div>
              </FieldSection>
            )}

            {!editMode && isPaid && paymentMethod === "card" && (
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-200 dark:border-slate-700 px-4 py-3 text-center shrink-0">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  دفع بالبطاقة — {total.toFixed(2)} ج
                </p>
              </div>
            )}

            <FieldSection
              label="ملاحظات التحضير"
              className="flex flex-col flex-1 min-h-0 [&>:last-child]:flex-1 [&>:last-child]:flex [&>:last-child]:flex-col"
            >
              <div className="relative flex-1 flex flex-col min-h-[56px]">
                <Receipt className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 z-10" />
                <Input
                  type="text"
                  placeholder="مثال: بدون سكر - زيادة ثلج..."
                  value={kitchenNote}
                  onChange={(e) => setKitchenNote(e.target.value)}
                  className="flex-1 min-h-[56px] h-full pr-10 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
                />
              </div>
            </FieldSection>
          </div>

          {!editMode && (
            <div className="shrink-0 w-[140px] sm:w-[160px] bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 flex flex-col px-2.5 py-3 sm:px-3 min-h-0">
              <div className="flex items-baseline justify-between gap-1 mb-2 shrink-0 px-0.5">
                <Label className="text-xs font-black text-slate-600 dark:text-slate-300">
                  الموظف المسؤول
                </Label>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">اختياري</span>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto overscroll-y-contain min-h-0 flex-1">
                {employees.map((emp) => {
                  const selected = selectedEmployee === emp.id.toString();
                  return (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() =>
                        setSelectedEmployee(selected ? "" : emp.id.toString())
                      }
                      className={cn(
                        "flex w-full flex-1 items-center justify-center gap-1.5 min-h-[44px] rounded-xl border-2 px-2 py-2 text-xs sm:text-sm font-black transition-all active:scale-[0.97]",
                        selected
                          ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                      )}
                    >
                      <User className={cn("w-3.5 h-3.5 shrink-0", selected ? "text-white" : "text-slate-400")} />
                      <span className="break-words text-center leading-tight">{emp.name}</span>
                    </button>
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
