import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  amountPaid: string;
  setAmountPaid: (value: string) => void;
  total: number;
  handleCheckout: () => void;
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
  amountPaid,
  setAmountPaid,
  total,
  handleCheckout,
}: CheckoutDialogProps) => {
  const change = Math.max(0, (parseFloat(amountPaid) || 0) - total);
  const isPaid = paymentStatus === "paid";

  return (
    <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
      <DialogContent
        className="max-w-md overflow-hidden overflow-x-hidden rounded-2xl border-none bg-white dark:bg-slate-900 shadow-2xl p-0 gap-0"
        dir="rtl"
      >
        <div className="bg-slate-900 p-4 text-white">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-black tracking-tight">تأكيد العملية</DialogTitle>
            <p className="text-slate-400 font-bold text-xs mt-1">خطوات نهائية لإصدار الفاتورة</p>
          </DialogHeader>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">الموظف المسؤول</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-full h-11 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl px-4 text-sm font-black">
                <SelectValue placeholder="-- اختر الموظف --" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id.toString()} className="font-bold py-2">
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">نوع الطلب</Label>
            <Select value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
              <SelectTrigger className="w-full h-11 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl px-4 text-sm font-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="takeaway">تيك اوي</SelectItem>
                <SelectItem value="table">طربيزة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">حالة الدفع</Label>
            <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}>
              <SelectTrigger className="w-full h-11 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl px-4 text-sm font-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">مدفوع</SelectItem>
                <SelectItem value="unpaid">غير مدفوع</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isPaid && (
            <>
              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">طريقة الدفع</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  <SelectTrigger className="w-full h-11 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl px-4 text-sm font-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="card">بطاقة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === "cash" && (
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">المبلغ المدفوع</Label>
                  <Input
                    type="number"
                    min={total}
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="h-11"
                  />
                  <p className="text-sm font-bold text-emerald-600">الباقي: {change.toFixed(2)} ج</p>
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">ملاحظات التحضير</Label>
            <div className="relative">
              <Receipt className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="مثال: بدون سكر - زيادة ثلج..."
                value={kitchenNote}
                onChange={(e) => setKitchenNote(e.target.value)}
                className="h-11 pr-10 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-sm font-bold"
              />
            </div>
          </div>

          <Button
            data-compact
            onClick={handleCheckout}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 font-black text-white text-sm"
          >
            إتمام البيع وطباعة الفاتورة ({total.toFixed(2)} ج)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
