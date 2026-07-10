import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Calendar, User, Printer, ChevronLeft, Clock, RotateCcw, CreditCard, Pencil, Search, Receipt } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useInvoiceEdit } from "@/contexts/InvoiceEditContext";
import { useToast } from "@/hooks/use-toast";
import { printInvoice } from "@/lib/invoicePrinter";
import { PayInvoiceDialog } from "@/components/sales/PayInvoiceDialog";
import type { SaleInvoice, InvoiceStatus, PaymentStatus } from "@/types/salesInvoice";
import { orderTypeLabels } from "@/types/salesInvoice";
import ProductPagination from "@/components/product-management/ProductPagination";
import { matchesDateRange, matchesTimeRange } from "@/lib/invoiceFilters";

const PAGE_SIZE = 10;

const statusLabels: Record<InvoiceStatus, string> = {
  completed: "مكتملة",
  void: "ملغاة",
  refunded: "مسترجعة",
  partial_refund: "استرجاع جزئي",
};

const paymentLabels: Record<PaymentStatus, string> = {
  paid: "مدفوعة",
  unpaid: "غير مدفوعة",
  partial: "مدفوعة جزئياً",
};

interface SalesInvoicesProps {
  onNavigate?: (tab: string) => void;
}

const SalesInvoices = ({ onNavigate }: SalesInvoicesProps) => {
  const [invoices, setInvoices] = useState<SaleInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<SaleInvoice | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [refundAmount, setRefundAmount] = useState("");
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const { isManagerOrAbove } = useAuth();
  const { startEditing } = useInvoiceEdit();
  const { toast } = useToast();

  const getInvoiceStatus = (invoice: SaleInvoice): InvoiceStatus =>
    (invoice.status ?? "completed") as InvoiceStatus;

  const getPaymentStatus = (invoice: SaleInvoice): PaymentStatus =>
    (invoice.payment_status ?? "paid") as PaymentStatus;

  const isEditableUnpaid = (invoice: SaleInvoice) =>
    getPaymentStatus(invoice) !== "paid" && getInvoiceStatus(invoice) === "completed";

  const loadInvoices = async () => {
    try {
      const data = await apiClient<{ status: string; invoices: SaleInvoice[] }>("/sales-invoices");
      if (data.status === "success") setInvoices(data.invoices);
    } catch (error: any) {
      toast({ title: "فشل تحميل الفواتير", description: error.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        (invoice.cashier || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      const matchesPayment = paymentFilter === "all" || invoice.payment_status === paymentFilter;
      const matchesOrderType = orderTypeFilter === "all" || invoice.order_type === orderTypeFilter;
      const matchesDate = matchesDateRange(invoice.date, dateFrom, dateTo);
      const matchesTime = matchesTimeRange(invoice.time, timeFrom, timeTo);

      return matchesSearch && matchesStatus && matchesPayment && matchesOrderType && matchesDate && matchesTime;
    });
  }, [invoices, search, statusFilter, paymentFilter, orderTypeFilter, dateFrom, dateTo, timeFrom, timeTo]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / PAGE_SIZE));

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredInvoices.slice(start, start + PAGE_SIZE);
  }, [filteredInvoices, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, paymentFilter, orderTypeFilter, dateFrom, dateTo, timeFrom, timeTo]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setOrderTypeFilter("all");
    setDateFrom("");
    setDateTo("");
    setTimeFrom("");
    setTimeTo("");
    setCurrentPage(1);
  };

  const handleVoid = async () => {
    if (!selectedInvoice) return;
    try {
      await apiClient(`/sales-invoices/${selectedInvoice.id}/void`, {
        method: "PATCH",
        body: JSON.stringify({ reason: "إلغاء من الواجهة" }),
      });
      toast({ title: "تم إلغاء الفاتورة" });
      setIsInvoiceDialogOpen(false);
      loadInvoices();
    } catch (error: any) {
      toast({ title: "فشل الإلغاء", description: error.message, variant: "destructive" });
    }
  };

  const handleRefund = async () => {
    if (!selectedInvoice) return;
    const amount = parseFloat(refundAmount);
    if (!amount || amount <= 0) return;

    const refundable = selectedInvoice.total - (selectedInvoice.refund_amount ?? 0);
    const isFullRefund = Math.abs(amount - refundable) < 0.01;
    const payload: {
      amount: number;
      reason: string;
      items?: Array<{ product_id: number | string; quantity: number; name: string }>;
    } = { amount, reason: "استرجاع من الواجهة" };

    if (isFullRefund) {
      payload.items = selectedInvoice.items.map((item) => ({
        product_id: item.product_id ?? item.id,
        quantity: item.quantity,
        name: item.name,
      }));
    }

    try {
      await apiClient(`/sales-invoices/${selectedInvoice.id}/refund`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast({ title: "تم تسجيل الاسترجاع" });
      setRefundAmount("");
      loadInvoices();
    } catch (error: any) {
      toast({ title: "فشل الاسترجاع", description: error.message, variant: "destructive" });
    }
  };

  const togglePaymentStatus = async () => {
    if (!selectedInvoice) return;
    const next: PaymentStatus = selectedInvoice.payment_status === "paid" ? "unpaid" : "paid";
    try {
      const data = await apiClient<{ invoice: SaleInvoice }>(`/sales-invoices/${selectedInvoice.id}/payment-status`, {
        method: "PATCH",
        body: JSON.stringify({ payment_status: next }),
      });
      setSelectedInvoice(data.invoice);
      loadInvoices();
      toast({ title: "تم تحديث حالة الدفع" });
    } catch (error: any) {
      toast({ title: "فشل التحديث", description: error.message, variant: "destructive" });
    }
  };

  const handleReprint = async () => {
    if (!selectedInvoice) return;
    try {
      await apiClient(`/sales-invoices/${selectedInvoice.id}/reprint`, { method: "POST" });
      printInvoice({
        invoiceNumber: selectedInvoice.invoiceNumber,
        date: selectedInvoice.date,
        time: selectedInvoice.time,
        employeeName: selectedInvoice.cashier || "",
        total: selectedInvoice.total,
        items: selectedInvoice.items,
        kitchen_note: selectedInvoice.kitchen_note,
        order_type: selectedInvoice.order_type,
        payment_status: selectedInvoice.payment_status,
        payment_method: selectedInvoice.payment_method,
        amount_paid: selectedInvoice.amount_paid,
        change_given: selectedInvoice.change_given,
      }, false);
      toast({ title: "تمت الطباعة" });
    } catch (error: any) {
      toast({ title: "فشلت الطباعة", description: error.message, variant: "destructive" });
    }
  };

  const handleEditInvoice = () => {
    if (!selectedInvoice) return;
    startEditing(selectedInvoice);
    setIsInvoiceDialogOpen(false);
    onNavigate?.("sales");
    toast({ title: "وضع التعديل", description: `تعديل فاتورة ${selectedInvoice.invoiceNumber}` });
  };

  const handleInvoicePaid = (invoice: SaleInvoice) => {
    setSelectedInvoice(invoice);
    loadInvoices();
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-3 antialiased" dir="rtl">
      {/* Header */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">سجل المبيعات</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">Sales Ledger & History</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2">
          <Receipt className="w-4 h-4 text-blue-600 shrink-0" />
          <div>
            <p className="text-[9px] font-bold text-slate-400 leading-none">الفواتير</p>
            <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">{filteredInvoices.length}</p>
          </div>
        </div>
      </div>

      {/* Filters — sticky, high z-index */}
      <div className="sticky top-0 z-40 shrink-0 isolate rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-sm p-3 sm:p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-black text-slate-500 dark:text-slate-400">فلاتر البحث</h3>
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 gap-1.5 text-xs font-bold text-slate-500 hover:text-red-500">
            <RotateCcw className="w-3.5 h-3.5" />
            مسح الفلاتر
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="بحث برقم الفاتورة أو الكاشير..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pr-10 rounded-xl text-sm font-bold"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 rounded-xl text-sm font-bold"><SelectValue placeholder="الحالة" /></SelectTrigger>
            <SelectContent className="z-[200]">
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="completed">مكتملة</SelectItem>
              <SelectItem value="void">ملغاة</SelectItem>
              <SelectItem value="refunded">مسترجعة</SelectItem>
              <SelectItem value="partial_refund">استرجاع جزئي</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="h-10 rounded-xl text-sm font-bold"><SelectValue placeholder="الدفع" /></SelectTrigger>
            <SelectContent className="z-[200]">
              <SelectItem value="all">كل حالات الدفع</SelectItem>
              <SelectItem value="paid">مدفوعة</SelectItem>
              <SelectItem value="unpaid">غير مدفوعة</SelectItem>
              <SelectItem value="partial">مدفوعة جزئياً</SelectItem>
            </SelectContent>
          </Select>
          <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
            <SelectTrigger className="h-10 rounded-xl text-sm font-bold"><SelectValue placeholder="نوع الطلب" /></SelectTrigger>
            <SelectContent className="z-[200]">
              <SelectItem value="all">كل أنواع الطلب</SelectItem>
              <SelectItem value="takeaway">تيك اوي</SelectItem>
              <SelectItem value="table">طربيزة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-400">من تاريخ</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 rounded-lg text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-400">إلى تاريخ</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 rounded-lg text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-400">من وقت</Label>
            <Input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} className="h-9 rounded-lg text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-400">إلى وقت</Label>
            <Input type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} className="h-9 rounded-lg text-sm" />
          </div>
        </div>
      </div>

      {/* Invoice list — scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain space-y-2 relative z-0 pb-1">
        {paginatedInvoices.length === 0 ? (
          <div className="min-h-[200px] flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <FileText className="w-10 h-10 mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-400">لا توجد فواتير</p>
          </div>
        ) : (
          paginatedInvoices.map((invoice) => (
            <button
              key={invoice.id}
              type="button"
              className="w-full text-right rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all active:scale-[0.995]"
              onClick={() => {
                setSelectedInvoice(invoice);
                setIsInvoiceDialogOpen(true);
              }}
            >
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge className="text-[10px] font-black h-5 px-2">{statusLabels[invoice.status || "completed"]}</Badge>
                  <Badge variant="outline" className="text-[10px] font-black h-5 px-2">{paymentLabels[invoice.payment_status || "paid"]}</Badge>
                  <Badge variant="secondary" className="text-[10px] font-black h-5 px-2">{orderTypeLabels[invoice.order_type || "takeaway"]}</Badge>
                </div>
                <h3 className="font-black text-base text-slate-800 dark:text-slate-100 truncate">{invoice.invoiceNumber}</h3>
                <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{invoice.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{invoice.time}</span>
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{invoice.cashier}</span>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                <p className="text-xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
                  {Number(invoice.total).toFixed(2)} <span className="text-xs">ج</span>
                </p>
                <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                  التفاصيل <ChevronLeft className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="shrink-0 pt-1">
        <ProductPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent
          className="max-w-4xl max-h-[90dvh] !flex !flex-col !gap-0 !p-0 !overflow-hidden rounded-[2rem]"
          dir="rtl"
        >
          {selectedInvoice && (
            <div className="flex flex-col max-h-[calc(90dvh-5rem)] w-full">
              <div className="shrink-0 space-y-4 p-6 pb-4">
                <DialogHeader>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge>{statusLabels[getInvoiceStatus(selectedInvoice)]}</Badge>
                    <Badge variant="outline">{paymentLabels[getPaymentStatus(selectedInvoice)]}</Badge>
                    <Badge variant="secondary">{orderTypeLabels[selectedInvoice.order_type || "takeaway"]}</Badge>
                  </div>
                  <DialogTitle className="text-2xl font-black">تفاصيل الفاتورة {selectedInvoice.invoiceNumber}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-muted-foreground">التاريخ</p><p className="font-bold">{selectedInvoice.date}</p></div>
                  <div><p className="text-muted-foreground">الوقت</p><p className="font-bold">{selectedInvoice.time}</p></div>
                  <div><p className="text-muted-foreground">البائع</p><p className="font-bold">{selectedInvoice.cashier}</p></div>
                  <div><p className="text-muted-foreground">الإجمالي</p><p className="font-bold">{Number(selectedInvoice.total).toFixed(2)} ج</p></div>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto px-6">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow>
                        <TableHead className="text-right">المنتج</TableHead>
                        <TableHead className="text-right">السعر</TableHead>
                        <TableHead className="text-center">الكمية</TableHead>
                        <TableHead className="text-left">الإجمالي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{Number(item.price).toFixed(2)}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell>{(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-background">
                {isEditableUnpaid(selectedInvoice) && (
                  <div className="flex flex-wrap gap-2">
                    <Button className="flex-1 min-w-[140px] gap-2" onClick={() => setIsPayDialogOpen(true)}>
                      <CreditCard className="w-4 h-4" /> دفع الفاتورة
                    </Button>
                    <Button variant="secondary" className="flex-1 min-w-[140px] gap-2" onClick={handleEditInvoice}>
                      <Pencil className="w-4 h-4" /> تعديل الفاتورة
                    </Button>
                  </div>
                )}

                {isManagerOrAbove && getInvoiceStatus(selectedInvoice) !== "void" && (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="destructive" onClick={handleVoid}>إلغاء الفاتورة</Button>
                    <Button variant="outline" onClick={togglePaymentStatus}>
                      {getPaymentStatus(selectedInvoice) === "paid" ? "تعيين غير مدفوعة" : "تعيين مدفوعة"}
                    </Button>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        placeholder="مبلغ الاسترجاع"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        className="w-40"
                      />
                      <Button onClick={handleRefund}>استرجاع</Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button className="flex-1 gap-2" onClick={handleReprint}>
                    <Printer className="w-4 h-4" /> إعادة طباعة
                  </Button>
                  <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>إغلاق</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PayInvoiceDialog
        open={isPayDialogOpen}
        onOpenChange={setIsPayDialogOpen}
        invoice={selectedInvoice}
        onPaid={handleInvoicePaid}
      />
    </div>
  );
};

export default SalesInvoices;
