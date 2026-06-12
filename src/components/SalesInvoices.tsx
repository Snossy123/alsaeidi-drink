import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Calendar, User, Printer, ChevronLeft, Clock } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { printInvoice } from "@/lib/invoicePrinter";
import type { SaleInvoice, InvoiceStatus, PaymentStatus } from "@/types/salesInvoice";

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

const SalesInvoices = () => {
  const [invoices, setInvoices] = useState<SaleInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<SaleInvoice | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const { isManagerOrAbove } = useAuth();
  const { toast } = useToast();

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
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [invoices, search, statusFilter, paymentFilter]);

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

    try {
      await apiClient(`/sales-invoices/${selectedInvoice.id}/refund`, {
        method: "POST",
        body: JSON.stringify({ amount, reason: "استرجاع من الواجهة" }),
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
      }, false);
      toast({ title: "تمت الطباعة" });
    } catch (error: any) {
      toast({ title: "فشلت الطباعة", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 antialiased" dir="rtl">
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-white/5">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600/20 p-4 rounded-[2rem] border border-white/10">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">سجل المبيعات</h1>
              <p className="text-blue-400/60 font-bold uppercase tracking-widest text-xs mt-1">Sales Ledger & History</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 px-6">
            <p className="text-2xl font-black text-white">{filteredInvoices.length}</p>
            <span className="text-[10px] font-black text-slate-500 uppercase">فاتورة</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input placeholder="بحث برقم الفاتورة أو الكاشير..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="completed">مكتملة</SelectItem>
            <SelectItem value="void">ملغاة</SelectItem>
            <SelectItem value="refunded">مسترجعة</SelectItem>
            <SelectItem value="partial_refund">استرجاع جزئي</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger><SelectValue placeholder="الدفع" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل حالات الدفع</SelectItem>
            <SelectItem value="paid">مدفوعة</SelectItem>
            <SelectItem value="unpaid">غير مدفوعة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredInvoices.length === 0 ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">لا توجد فواتير</CardContent></Card>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card
              key={invoice.id}
              className="cursor-pointer hover:shadow-lg transition-all"
              onClick={() => {
                setSelectedInvoice(invoice);
                setIsInvoiceDialogOpen(true);
              }}
            >
              <CardContent className="p-5 flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge>{statusLabels[invoice.status || "completed"]}</Badge>
                    <Badge variant="outline">{paymentLabels[invoice.payment_status || "paid"]}</Badge>
                  </div>
                  <h3 className="font-black text-lg">{invoice.invoiceNumber}</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{invoice.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{invoice.time}</span>
                    <span className="flex items-center gap-1"><User className="w-4 h-4" />{invoice.cashier}</span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black text-blue-600">{Number(invoice.total).toFixed(2)} ج</p>
                  <Button variant="ghost" className="mt-2 gap-2">طلب التفاصيل <ChevronLeft className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90dvh] overflow-y-auto rounded-[2rem]" dir="rtl">
          {selectedInvoice && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge>{statusLabels[selectedInvoice.status || "completed"]}</Badge>
                  <Badge variant="outline">{paymentLabels[selectedInvoice.payment_status || "paid"]}</Badge>
                </div>
                <DialogTitle className="text-2xl font-black">تفاصيل الفاتورة {selectedInvoice.invoiceNumber}</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><p className="text-muted-foreground">التاريخ</p><p className="font-bold">{selectedInvoice.date}</p></div>
                <div><p className="text-muted-foreground">الوقت</p><p className="font-bold">{selectedInvoice.time}</p></div>
                <div><p className="text-muted-foreground">البائع</p><p className="font-bold">{selectedInvoice.cashier}</p></div>
                <div><p className="text-muted-foreground">الإجمالي</p><p className="font-bold">{Number(selectedInvoice.total).toFixed(2)} ج</p></div>
              </div>

              <Table>
                <TableHeader>
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

              {isManagerOrAbove && selectedInvoice.status !== "void" && (
                <div className="flex flex-wrap gap-2">
                  <Button variant="destructive" onClick={handleVoid}>إلغاء الفاتورة</Button>
                  <Button variant="outline" onClick={togglePaymentStatus}>
                    {selectedInvoice.payment_status === "paid" ? "تعيين غير مدفوعة" : "تعيين مدفوعة"}
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesInvoices;
