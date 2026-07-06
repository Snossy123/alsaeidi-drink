
import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, RotateCcw, Search } from "lucide-react";
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

const PAGE_SIZE = 10;

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
      } catch {
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
    <div className="flex flex-col h-full min-h-0 gap-3 antialiased" dir="rtl">
      <PurchaseInvoiceHeader
        invoiceCount={filteredInvoices.length}
        onAddClick={() => setIsAddDialogOpen(true)}
      />

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
              placeholder="بحث برقم الفاتورة أو المورد..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pr-10 rounded-xl text-sm font-bold"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as PurchaseInvoiceType | "all")}>
            <SelectTrigger className="h-10 rounded-xl text-sm font-bold">
              <SelectValue placeholder="نوع الفاتورة" />
            </SelectTrigger>
            <SelectContent className="z-[200]">
              <SelectItem value="all">كل الأنواع</SelectItem>
              <SelectItem value="general">{purchaseInvoiceTypeLabels.general}</SelectItem>
              <SelectItem value="operation">{purchaseInvoiceTypeLabels.operation}</SelectItem>
            </SelectContent>
          </Select>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-400">من تاريخ</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 rounded-lg text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-400">إلى تاريخ</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 rounded-lg text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-400">من وقت</Label>
            <Input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} className="h-9 rounded-lg text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-400">إلى وقت</Label>
            <Input type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} className="h-9 rounded-lg text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-400">من مبلغ</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="h-9 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-400">إلى مبلغ</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="h-9 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain space-y-2 relative z-0 pb-1">
        {invoices.length === 0 ? (
          <div className="min-h-[200px] flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <FileText className="w-10 h-10 mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-400">لا توجد سجلات مشتريات حتى الآن</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="min-h-[200px] flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <FileText className="w-10 h-10 mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-400">لا توجد نتائج مطابقة للفلاتر</p>
            {hasActiveFilters && (
              <Button variant="link" onClick={resetFilters} className="mt-2 text-xs">
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

      <div className="shrink-0 pt-1">
        <ProductPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90dvh] p-0 overflow-y-auto rounded-2xl border-none bg-white dark:bg-slate-900 shadow-2xl" dir="rtl">
          {isAddDialogOpen && (
            <AddPurchaseInvoiceForm
              categories={categories}
              onSubmit={handleInvoiceSubmit}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90dvh] p-0 overflow-y-auto rounded-2xl border-none bg-white dark:bg-slate-900 shadow-2xl" dir="rtl">
          <div className="bg-slate-900 p-6 text-white relative shrink-0">
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col min-w-0">
                <span className={`self-start border px-2.5 py-0.5 font-black text-[10px] rounded-full mb-1 ${
                  selectedInvoice && getPurchaseInvoiceType(selectedInvoice) === "general"
                    ? "bg-purple-600/10 text-purple-400 border-purple-400/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-400/30"
                }`}>
                  {selectedInvoice ? purchaseInvoiceTypeLabels[getPurchaseInvoiceType(selectedInvoice)] : ""}
                </span>
                <h2 className="text-lg sm:text-xl font-black tracking-tight truncate">
                  تفاصيل فاتورة {selectedInvoice?.invoice_number}
                </h2>
              </div>
              <div className="text-left bg-white/10 rounded-xl px-4 py-2 shrink-0">
                <p className="text-[10px] font-bold text-slate-400 mb-0.5">إجمالي الفاتورة</p>
                <div className="text-xl font-black">{Number(selectedInvoice?.total).toFixed(2)} <span className="text-xs">ج</span></div>
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
