import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Clock, FileText, Loader2, Pencil, Receipt, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useInvoiceEdit } from "@/contexts/InvoiceEditContext";
import { useToast } from "@/hooks/use-toast";
import type { Employee } from "@/hooks/useSalesData";
import type { InvoiceStatus, PaymentStatus, SaleInvoice } from "@/types/salesInvoice";
import { orderTypeLabels } from "@/types/salesInvoice";
import { cn } from "@/lib/utils";

interface UnpaidInvoicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
}

const isEditableUnpaid = (invoice: SaleInvoice) => {
  const payment = (invoice.payment_status ?? "paid") as PaymentStatus;
  const status = (invoice.status ?? "completed") as InvoiceStatus;
  return payment !== "paid" && status === "completed";
};

const invoiceBelongsToEmployee = (invoice: SaleInvoice, employee: Employee) => {
  if (invoice.employee_id != null && String(invoice.employee_id) === String(employee.id)) {
    return true;
  }
  return (invoice.cashier || "").trim() === employee.name.trim();
};

export const UnpaidInvoicesDialog = ({
  open,
  onOpenChange,
  employees,
}: UnpaidInvoicesDialogProps) => {
  const { user } = useAuth();
  const { startEditing } = useInvoiceEdit();
  const { toast } = useToast();

  const [invoices, setInvoices] = useState<SaleInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient<{ status: string; invoices: SaleInvoice[] }>("/sales-invoices");
      if (data.status === "success") {
        setInvoices(data.invoices);
      }
    } catch (error: any) {
      toast({
        title: "فشل تحميل الفواتير",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!open) return;
    loadInvoices();
  }, [open, loadInvoices]);

  const unpaidInvoices = useMemo(
    () => invoices.filter(isEditableUnpaid),
    [invoices]
  );

  useEffect(() => {
    if (!open || employees.length === 0) return;

    if (user?.type === "employee" && employees.some((e) => String(e.id) === String(user.id))) {
      setSelectedEmployeeId(String(user.id));
      return;
    }

    const withUnpaid = employees.find((emp) =>
      unpaidInvoices.some((inv) => invoiceBelongsToEmployee(inv, emp))
    );
    setSelectedEmployeeId(String(withUnpaid?.id ?? employees[0].id));
  }, [open, employees, user, unpaidInvoices]);

  const selectedEmployee = useMemo(
    () => employees.find((e) => String(e.id) === selectedEmployeeId) ?? null,
    [employees, selectedEmployeeId]
  );

  const employeeInvoices = useMemo(() => {
    if (!selectedEmployee) return [];
    return unpaidInvoices.filter((inv) => invoiceBelongsToEmployee(inv, selectedEmployee));
  }, [unpaidInvoices, selectedEmployee]);

  const unpaidCountByEmployee = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const emp of employees) {
      counts[String(emp.id)] = unpaidInvoices.filter((inv) =>
        invoiceBelongsToEmployee(inv, emp)
      ).length;
    }
    return counts;
  }, [employees, unpaidInvoices]);

  const handleEdit = (invoice: SaleInvoice) => {
    startEditing(invoice);
    onOpenChange(false);
    toast({
      title: "وضع التعديل",
      description: `تعديل فاتورة ${invoice.invoiceNumber}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-2xl !p-0 !gap-0 !rounded-2xl !overflow-hidden border-none bg-white dark:bg-slate-900 shadow-2xl"
        dir="rtl"
      >
        <DialogHeader className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-black text-slate-800 dark:text-white">
            <div className="bg-amber-500/15 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            فواتير غير مدفوعة
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <p className="text-sm font-bold text-slate-500 mb-2 flex items-center gap-1.5">
            <User className="w-4 h-4" />
            الموظف
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {employees.length === 0 ? (
              <p className="text-sm text-slate-400 font-bold py-2">لا يوجد موظفون</p>
            ) : (
              employees.map((emp) => {
                const count = unpaidCountByEmployee[String(emp.id)] ?? 0;
                const selected = String(emp.id) === selectedEmployeeId;
                return (
                  <Button
                    key={emp.id}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    onClick={() => setSelectedEmployeeId(String(emp.id))}
                    className={cn(
                      "shrink-0 h-10 rounded-xl font-black text-sm gap-2",
                      selected
                        ? "bg-blue-600 hover:bg-blue-500 text-white"
                        : "border-slate-300 text-slate-700 dark:text-slate-200"
                    )}
                  >
                    {emp.name}
                    {count > 0 && (
                      <Badge
                        className={cn(
                          "h-5 min-w-5 px-1.5 text-xs font-black",
                          selected
                            ? "bg-white/20 text-white hover:bg-white/20"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                        )}
                      >
                        {count}
                      </Badge>
                    )}
                  </Button>
                );
              })
            )}
          </div>
        </div>

        <div className="max-h-[min(55dvh,420px)] overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm font-bold">جاري التحميل...</p>
            </div>
          ) : employeeInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-400">
              <Receipt className="w-10 h-10 opacity-50" />
              <p className="text-base font-black text-slate-500 dark:text-slate-400">
                لا توجد فواتير غير مدفوعة لهذا الموظف
              </p>
            </div>
          ) : (
            employeeInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-base text-slate-800 dark:text-white">
                      {invoice.invoiceNumber}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs font-black border-amber-300 text-amber-800 bg-amber-50"
                    >
                      {(invoice.payment_status ?? "unpaid") === "partial"
                        ? "مدفوعة جزئياً"
                        : "غير مدفوعة"}
                    </Badge>
                    {invoice.order_type && (
                      <Badge variant="outline" className="text-xs font-black">
                        {orderTypeLabels[invoice.order_type]}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {invoice.date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {invoice.time}
                    </span>
                    <span className="text-blue-700 dark:text-blue-400 font-black tabular-nums">
                      {Number(invoice.total).toFixed(2)} ج
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => handleEdit(invoice)}
                  className="shrink-0 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm gap-1.5"
                >
                  <Pencil className="w-4 h-4" />
                  تعديل
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
