import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { printInvoice } from "@/lib/invoicePrinter";
import type { PaymentMethod, SaleInvoice } from "@/types/salesInvoice";

interface PayInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: SaleInvoice | null;
  onPaid: (invoice: SaleInvoice) => void;
}

export const PayInvoiceDialog = ({ open, onOpenChange, invoice, onPaid }: PayInvoiceDialogProps) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const wasOpenRef = useRef(false);

  const total = invoice ? Number(invoice.total) : 0;

  useEffect(() => {
    if (open && invoice && !wasOpenRef.current) {
      setPaymentMethod("cash");
      setAmountPaid(total.toFixed(2));
    }
    wasOpenRef.current = open;
  }, [open, invoice, total]);

  const paid = parseFloat(amountPaid) || 0;
  const change = Math.max(0, paid - total);
  const remaining = Math.max(0, total - paid);

  const handlePay = async () => {
    if (!invoice) return;

    if (paymentMethod === "cash" && paid < total) {
      toast({ title: "المبلغ المدفوع أقل من الإجمالي", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiClient<{ status: string; invoice: SaleInvoice; message?: string }>(
        `/sales-invoices/${invoice.id}/pay`,
        {
          method: "POST",
          body: JSON.stringify({
            payment_method: paymentMethod,
            amount_paid: paymentMethod === "cash" ? paid : total,
          }),
        }
      );

      if (data.status === "success") {
        try {
          printInvoice({
            invoiceNumber: data.invoice.invoiceNumber,
            date: data.invoice.date,
            time: data.invoice.time,
            employeeName: data.invoice.cashier || "",
            total: Number(data.invoice.total),
            items: data.invoice.items,
            kitchen_note: data.invoice.kitchen_note,
            order_type: data.invoice.order_type,
            payment_status: "paid",
          }, false);
        } catch {
          // Payment succeeded; printing is optional
        }
        toast({ title: "تم دفع الفاتورة" });
        onPaid(data.invoice);
        onOpenChange(false);
      } else {
        toast({ title: "فشل الدفع", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "فشل الدفع", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-xl font-black">دفع الفاتورة</DialogTitle>
          <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4 text-center">
            <p className="text-xs font-bold text-muted-foreground">الإجمالي</p>
            <p className="text-2xl font-black">{total.toFixed(2)} ج</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black text-muted-foreground">طريقة الدفع</Label>
            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <SelectTrigger className="h-11">
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
              <Label className="text-xs font-black text-muted-foreground">المبلغ المدفوع</Label>
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
                className="h-11 text-left"
              />
              {paid >= total ? (
                <p className="text-sm font-bold text-emerald-600">الباقي: {change.toFixed(2)} ج</p>
              ) : (
                <p className="text-sm font-bold text-amber-600">المتبقي: {remaining.toFixed(2)} ج</p>
              )}
            </div>
          )}

          <Button
            className="w-full h-11 font-black"
            onClick={handlePay}
            disabled={submitting}
          >
            {submitting ? "جاري الدفع..." : "تأكيد الدفع"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
