
import { useState, useEffect, useCallback, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileText, Calendar, TrendingUp, ShoppingCart, Package, DollarSign, BarChart3, Printer } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

const reportTypes = [
  { value: "sales", label: "تقرير المبيعات", icon: TrendingUp },
  { value: "purchases", label: "تقرير المشتريات", icon: ShoppingCart },
  { value: "profits", label: "تقرير الأرباح", icon: DollarSign },
  { value: "top-selling", label: "المنتجات الأكثر مبيعاً", icon: TrendingUp },
  { value: "purchased-items", label: "المنتجات المشتراة", icon: Package },
  { value: "sold-items", label: "المنتجات المباعة", icon: Package },
] as const;

function getMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

const defaultRange = getMonthRange();

const ReportsSection = () => {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState("sales");
  const [dateFrom, setDateFrom] = useState(defaultRange.from);
  const [dateTo, setDateTo] = useState(defaultRange.to);
  const [reportData, setReportData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);

  const generateReport = useCallback(async () => {
    if (!dateFrom || !dateTo) {
      toast({
        title: "تنبيه",
        description: "يرجى تحديد تاريخ البداية والنهاية",
        variant: "destructive",
      });
      return;
    }

    if (dateFrom > dateTo) {
      toast({
        title: "تنبيه",
        description: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const data = await apiClient<Record<string, unknown>[]>(
        `/reports?type=${selectedReport}&from=${dateFrom}&to=${dateTo}`
      );
      setReportData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("فشل في جلب التقرير:", error);
      setReportData([]);
      toast({
        title: "خطأ",
        description: "تعذر إنشاء التقرير — تحقق من الاتصال بالخادم",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, selectedReport, toast]);

  useEffect(() => {
    if (dateFrom && dateTo) {
      generateReport();
    }
  }, [selectedReport]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentReport = reportTypes.find((r) => r.value === selectedReport);
  const ReportIcon = currentReport?.icon ?? FileText;

  const sumField = (field: string) =>
    reportData.reduce((acc, row) => acc + Number(row[field] ?? 0), 0);

  const renderEmpty = () => (
    <div className="min-h-[240px] flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
      <BarChart3 className="w-10 h-10 mb-2 text-slate-300" />
      <p className="text-sm font-bold text-slate-400">
        {!dateFrom || !dateTo ? "حدد الفترة واضغط إنشاء التقرير" : "لا توجد بيانات للفترة المحددة"}
      </p>
    </div>
  );

  const renderTable = (headers: string[], rows: ReactNode, footer?: ReactNode) => (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800">
          <tr className="border-b border-slate-200 dark:border-slate-700">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-right text-xs font-black text-slate-600 dark:text-slate-300 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
        {footer && (
          <tfoot className="bg-slate-50 dark:bg-slate-900/80 border-t-2 border-slate-200 dark:border-slate-700">
            {footer}
          </tfoot>
        )}
      </table>
    </div>
  );

  const rowClass = (index: number) =>
    index % 2 === 0
      ? "bg-white dark:bg-slate-900"
      : "bg-slate-50/80 dark:bg-slate-900/60";

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="min-h-[240px] flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400">جاري إنشاء التقرير...</p>
        </div>
      );
    }

    if (!reportData.length) return renderEmpty();

    switch (selectedReport) {
      case "sales": {
        const totalInvoices = sumField("invoices");
        const totalSales = sumField("total");
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-blue-50 dark:bg-blue-950/30">
                <p className="text-[10px] font-bold text-slate-500">إجمالي الفواتير</p>
                <p className="text-lg font-black text-blue-600">{totalInvoices}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-emerald-50 dark:bg-emerald-950/30 col-span-2 sm:col-span-1">
                <p className="text-[10px] font-bold text-slate-500">إجمالي المبيعات</p>
                <p className="text-lg font-black text-emerald-600">{totalSales.toFixed(2)} ج</p>
              </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {renderTable(
                ["التاريخ", "عدد الفواتير", "إجمالي المبيعات"],
                reportData.map((item, index) => (
                  <tr key={index} className={`border-b border-slate-100 dark:border-slate-800 ${rowClass(index)}`}>
                    <td className="px-4 py-2.5 text-right font-bold">{String(item.date)}</td>
                    <td className="px-4 py-2.5 text-right">{String(item.invoices)}</td>
                    <td className="px-4 py-2.5 text-right font-black text-blue-600">
                      {Number(item.total).toFixed(2)} ج
                    </td>
                  </tr>
                )),
                <tr>
                  <td className="px-4 py-3 text-right font-black">الإجمالي</td>
                  <td className="px-4 py-3 text-right font-black">{totalInvoices}</td>
                  <td className="px-4 py-3 text-right font-black text-blue-600">{totalSales.toFixed(2)} ج</td>
                </tr>
              )}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 min-h-[280px]">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => [`${value} ج`, "المبيعات"]} />
                    <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      }

      case "purchases": {
        const totalInvoices = sumField("invoices");
        const totalItems = sumField("items");
        const totalPurchases = sumField("total");
        return renderTable(
          ["التاريخ", "النوع", "عدد الفواتير", "عدد الأصناف", "إجمالي المشتريات"],
          reportData.map((item, index) => (
            <tr key={index} className={`border-b border-slate-100 dark:border-slate-800 ${rowClass(index)}`}>
              <td className="px-4 py-2.5 text-right font-bold">{String(item.date)}</td>
              <td className="px-4 py-2.5 text-right text-xs">
                {item.invoice_type === "general" ? "عام" : String(item.invoice_type ?? "—")}
              </td>
              <td className="px-4 py-2.5 text-right">{String(item.invoices)}</td>
              <td className="px-4 py-2.5 text-right">{String(item.items)}</td>
              <td className="px-4 py-2.5 text-right font-black text-emerald-600">
                {Number(item.total).toFixed(2)} ج
              </td>
            </tr>
          )),
          <tr>
            <td className="px-4 py-3 text-right font-black" colSpan={2}>الإجمالي</td>
            <td className="px-4 py-3 text-right font-black">{totalInvoices}</td>
            <td className="px-4 py-3 text-right font-black">{totalItems}</td>
            <td className="px-4 py-3 text-right font-black text-emerald-600">{totalPurchases.toFixed(2)} ج</td>
          </tr>
        );
      }

      case "profits": {
        const totalSales = sumField("sales");
        const totalPurchases = sumField("purchases");
        const totalProfit = sumField("profit");
        return renderTable(
          ["التاريخ", "المبيعات", "المشتريات", "صافي الربح"],
          reportData.map((item, index) => (
            <tr key={index} className={`border-b border-slate-100 dark:border-slate-800 ${rowClass(index)}`}>
              <td className="px-4 py-2.5 text-right font-bold">{String(item.date)}</td>
              <td className="px-4 py-2.5 text-right text-blue-600">{Number(item.sales).toFixed(2)} ج</td>
              <td className="px-4 py-2.5 text-right text-red-500">{Number(item.purchases).toFixed(2)} ج</td>
              <td className={`px-4 py-2.5 text-right font-black ${Number(item.profit) >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {Number(item.profit).toFixed(2)} ج
              </td>
            </tr>
          )),
          <tr>
            <td className="px-4 py-3 text-right font-black">الإجمالي</td>
            <td className="px-4 py-3 text-right font-black text-blue-600">{totalSales.toFixed(2)} ج</td>
            <td className="px-4 py-3 text-right font-black text-red-500">{totalPurchases.toFixed(2)} ج</td>
            <td className={`px-4 py-3 text-right font-black ${totalProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {totalProfit.toFixed(2)} ج
            </td>
          </tr>
        );
      }

      case "top-selling": {
        const totalQty = sumField("quantity");
        const totalRevenue = sumField("revenue");
        return renderTable(
          ["#", "المنتج", "الكمية المباعة", "إجمالي الإيرادات"],
          reportData.map((item, index) => (
            <tr key={index} className={`border-b border-slate-100 dark:border-slate-800 ${rowClass(index)}`}>
              <td className="px-4 py-2.5 text-right font-bold text-slate-400">{index + 1}</td>
              <td className="px-4 py-2.5 text-right font-bold">{String(item.product_name)}</td>
              <td className="px-4 py-2.5 text-right">{String(item.quantity)}</td>
              <td className="px-4 py-2.5 text-right font-black text-blue-600">{Number(item.revenue).toFixed(2)} ج</td>
            </tr>
          )),
          <tr>
            <td className="px-4 py-3 text-right font-black" colSpan={2}>الإجمالي</td>
            <td className="px-4 py-3 text-right font-black">{totalQty}</td>
            <td className="px-4 py-3 text-right font-black text-blue-600">{totalRevenue.toFixed(2)} ج</td>
          </tr>
        );
      }

      case "purchased-items": {
        const totalQty = sumField("quantity");
        const totalCost = sumField("cost");
        return renderTable(
          ["المنتج", "الكمية المشتراة", "إجمالي التكلفة"],
          reportData.map((item, index) => (
            <tr key={index} className={`border-b border-slate-100 dark:border-slate-800 ${rowClass(index)}`}>
              <td className="px-4 py-2.5 text-right font-bold">{String(item.product_name)}</td>
              <td className="px-4 py-2.5 text-right">{String(item.quantity)}</td>
              <td className="px-4 py-2.5 text-right font-black text-emerald-600">{Number(item.cost).toFixed(2)} ج</td>
            </tr>
          )),
          <tr>
            <td className="px-4 py-3 text-right font-black">الإجمالي</td>
            <td className="px-4 py-3 text-right font-black">{totalQty}</td>
            <td className="px-4 py-3 text-right font-black text-emerald-600">{totalCost.toFixed(2)} ج</td>
          </tr>
        );
      }

      case "sold-items": {
        const soldOnly = reportData
          .filter((item) => Number(item.quantity_sold) > 0)
          .sort((a, b) => Number(b.quantity_sold) - Number(a.quantity_sold));
        const displayData = soldOnly.length ? soldOnly : reportData;
        const totalSold = displayData.reduce((acc, row) => acc + Number(row.quantity_sold ?? 0), 0);

        return renderTable(
          ["المنتج", "الكمية المباعة", "المخزون الحالي"],
          displayData.map((item, index) => (
            <tr key={index} className={`border-b border-slate-100 dark:border-slate-800 ${rowClass(index)}`}>
              <td className="px-4 py-2.5 text-right font-bold">{String(item.product_name)}</td>
              <td className="px-4 py-2.5 text-right text-blue-600 font-bold">{String(item.quantity_sold)}</td>
              <td className={`px-4 py-2.5 text-right font-black ${Number(item.remaining) <= 5 ? "text-red-500" : "text-amber-600"}`}>
                {String(item.remaining)}
              </td>
            </tr>
          )),
          <tr>
            <td className="px-4 py-3 text-right font-black">إجمالي المباع</td>
            <td className="px-4 py-3 text-right font-black text-blue-600">{totalSold}</td>
            <td className="px-4 py-3 text-right font-black text-slate-400">—</td>
          </tr>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-3 antialiased" dir="rtl">
      <div className="shrink-0 px-1">
        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">التقارير والإحصائيات</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">تحليل المبيعات والمشتريات والأرباح</p>
      </div>

      <div className="sticky top-0 z-40 shrink-0 isolate rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-sm p-3 sm:p-4 space-y-3">
        <h3 className="text-xs font-black text-slate-500 dark:text-slate-400">إعدادات التقرير</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-400">نوع التقرير</Label>
            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger className="h-10 rounded-xl text-sm font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                {reportTypes.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-400">من تاريخ</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-10 rounded-xl text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-400">إلى تاريخ</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-10 rounded-xl text-sm" />
          </div>
          <div className="space-y-1 flex flex-col justify-end">
            <Button onClick={generateReport} disabled={loading} className="h-10 w-full bg-blue-600 hover:bg-blue-700 font-bold rounded-xl gap-1.5">
              <Calendar className="w-4 h-4" />
              {loading ? "جاري التحميل..." : "إنشاء التقرير"}
            </Button>
          </div>
          <div className="space-y-1 flex flex-col justify-end">
            <Button
              variant="outline"
              onClick={() => window.print()}
              disabled={!reportData.length || loading}
              className="h-10 w-full font-bold rounded-xl gap-1.5 print:hidden"
            >
              <Printer className="w-4 h-4" />
              طباعة
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain relative z-0 pb-1" id="report-content">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <ReportIcon className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
              {currentReport?.label}
            </h3>
            {dateFrom && dateTo && (
              <span className="text-[10px] font-bold text-slate-400 mr-auto">
                {dateFrom} — {dateTo}
              </span>
            )}
          </div>
          {renderReportContent()}
        </div>
      </div>
    </div>
  );
};

export default ReportsSection;
