
import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, RotateCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { PurchaseInvoice, Category, PurchaseInvoiceType, getPurchaseInvoiceType, purchaseInvoiceTypeLabels } from "@/types/invoices";
import { matchesAmountRange, matchesDateRange, matchesTimeRange } from "@/lib/invoiceFilters";
import ProductPagination from "@/components/product-management/ProductPagination";

import PurchaseInvoiceHeader from "./purchase-invoices/PurchaseInvoiceHeader";
import PurchaseInvoiceCard from "./purchase-invoices/PurchaseInvoiceCard";
import PurchaseInvoiceDetails from "./purchase-invoices/PurchaseInvoiceDetails";
import AddPurchaseInvoiceForm from "./purchase-invoices/AddPurchaseInvoiceForm";

const PAGE_SIZE = 9;

const saveInvoice = async (invoiceData: any) => {
  return apiClient<{ invoice?: PurchaseInvoice }>('/purchase-invoices', {
    method: 'POST',
    body: JSON.stringify(invoiceData),
  });
};

const fetchInvoices = async (invoiceType?: PurchaseInvoiceType | "all") => {
  const query = invoiceType && invoiceType !== "all" ? `?invoice_type=${invoiceType}` : "";
  return apiClient<{ invoices: PurchaseInvoice[] }>(`/purchase-invoices${query}`);
};

const PurchaseInvoices = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const { toast } = useToast();

  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [typeFilter, setTypeFilter] = useState<PurchaseInvoiceType | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await apiClient<{ categories: Category[] }>('/categories');
        setCategories(categoriesData.categories || []);
      } catch (error) {
        toast({
          title: "خطأ في الاتصال",
          description: "تعذر تحميل البيانات من الخادم",
          variant: "destructive"
        });
      }
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    fetchInvoices(typeFilter === "all" ? undefined : typeFilter)
      .then((data) => setInvoices(data.invoices))
      .catch((error) => {
        console.error(error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء تحميل الفواتير",
          variant: "destructive"
        });
      });
  }, [toast, typeFilter]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const query = search.toLowerCase();
      const matchesSearch =
        invoice.invoice_number.toLowerCase().includes(query) ||
        (invoice.supplier || "").toLowerCase().includes(query);
      const matchesDate = matchesDateRange(invoice.date, dateFrom, dateTo);
      const matchesTime = matchesTimeRange(invoice.time, timeFrom, timeTo);
      const matchesAmount = matchesAmountRange(Number(invoice.total), minAmount, maxAmount);

      return matchesSearch && matchesDate && matchesTime && matchesAmount;
    });
  }, [invoices, search, dateFrom, dateTo, timeFrom, timeTo, minAmount, maxAmount]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / PAGE_SIZE));

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredInvoices.slice(start, start + PAGE_SIZE);
  }, [filteredInvoices, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateFrom, dateTo, timeFrom, timeTo, minAmount, maxAmount, typeFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const resetFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setTimeFrom("");
    setTimeTo("");
    setMinAmount("");
    setMaxAmount("");
    setTypeFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search || dateFrom || dateTo || timeFrom || timeTo || minAmount || maxAmount || typeFilter !== "all";

  const handleInvoiceSubmit = async (newInvoice: any) => {
    try {
      const result = await saveInvoice(newInvoice);
      const savedNumber = result.invoice?.invoice_number || newInvoice.invoice_number;
      const updatedInvoices = await fetchInvoices(typeFilter === "all" ? undefined : typeFilter);
      setInvoices(updatedInvoices.invoices);

      toast({
        title: "تم إضافة الفاتورة",
        description: `تم إضافة فاتورة الشراء ${savedNumber} بنجاح`,
      });

      setIsAddDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "خطأ",
        description: "فشل حفظ الفاتورة، حاول مرة أخرى",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6 antialiased" dir="rtl">
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <PurchaseInvoiceHeader invoiceCount={filteredInvoices.length} />

        <DialogContent className="max-w-6xl max-h-[90dvh] p-0 overflow-y-auto rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.3)]" dir="rtl">
          {isAddDialogOpen && (
            <AddPurchaseInvoiceForm
              categories={categories}
              onSubmit={handleInvoiceSubmit}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-black text-sm text-muted-foreground">فلاتر البحث</h2>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              مسح الفلاتر
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              placeholder="بحث برقم الفاتورة أو المورد..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as PurchaseInvoiceType | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="نوع الفاتورة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأنواع</SelectItem>
                <SelectItem value="general">{purchaseInvoiceTypeLabels.general}</SelectItem>
                <SelectItem value="operation">{purchaseInvoiceTypeLabels.operation}</SelectItem>
              </SelectContent>
            </Select>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">من تاريخ</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">إلى تاريخ</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">من وقت</Label>
              <Input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">إلى وقت</Label>
              <Input type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">من مبلغ</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">إلى مبلغ</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {invoices.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
            <FileText className="w-16 h-16 text-slate-300 mb-4 opacity-50" />
            <p className="text-lg font-black text-slate-400">لا توجد سجلات مشتريات حتى الآن</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
            <FileText className="w-16 h-16 text-slate-300 mb-4 opacity-50" />
            <p className="text-lg font-black text-slate-400">لا توجد نتائج مطابقة للفلاتر</p>
            {hasActiveFilters && (
              <Button variant="link" onClick={resetFilters} className="mt-2">
                مسح الفلاتر
              </Button>
            )}
          </div>
        ) : (
          paginatedInvoices.map((invoice) => (
            <PurchaseInvoiceCard
              key={invoice.id}
              invoice={invoice}
              onClick={(inv) => {
                setSelectedInvoice(inv);
                setIsInvoiceDialogOpen(true);
              }}
            />
          ))
        )}
      </div>

      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90dvh] p-0 overflow-y-auto rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.3)]" dir="rtl">
          <div className="bg-slate-900 p-8 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-600 p-2.5 rounded-2xl shadow-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className={`border px-3 py-1 font-black text-xs rounded-full ${
                    selectedInvoice && getPurchaseInvoiceType(selectedInvoice) === "general"
                      ? "bg-purple-600/10 text-purple-400 border-purple-400/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-400/30"
                  }`}>
                    {selectedInvoice ? purchaseInvoiceTypeLabels[getPurchaseInvoiceType(selectedInvoice)] : ""}
                  </span>
                </div>
                <h2 className="text-3xl font-black tracking-tight">تفاصيل فاتورة المشتريات {selectedInvoice?.invoice_number}</h2>
              </div>

              <div className="text-left bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10 min-w-0 flex-1">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">إجمالي مشتريات الفاتورة</p>
                <div className="text-3xl font-black text-white">{Number(selectedInvoice?.total).toFixed(2)} <span className="text-sm">جنية</span></div>
              </div>
            </div>
          </div>

          {selectedInvoice && (
            <PurchaseInvoiceDetails
              invoice={selectedInvoice}
              categories={categories}
              onClose={() => setIsInvoiceDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseInvoices;
