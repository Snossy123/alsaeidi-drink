import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/lib/apiClient";
import { printShiftReport } from "@/lib/shiftReportPrinter";
import { useToast } from "@/hooks/use-toast";
import type { Shift, ShiftReportData } from "@/types/shift";
import { Clock, User, Search, FileText, Printer, Loader2 } from "lucide-react";

const paymentLabels: Record<string, string> = {
  cash: "نقدي",
  card: "بطاقة",
  mixed: "مختلط",
};

const ShiftReport = () => {
  const { toast } = useToast();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [report, setReport] = useState<ShiftReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadShifts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient<{ shifts: Shift[] }>("/shifts");
      setShifts(data.shifts || []);
    } catch {
      toast({
        title: "خطأ",
        description: "تعذر تحميل الورديات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const filteredShifts = useMemo(() => {
    return shifts.filter((shift) => {
      if (statusFilter !== "all" && shift.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      const name = shift.employee?.name?.toLowerCase() ?? "";
      return name.includes(q) || String(shift.id).includes(q);
    });
  }, [shifts, search, statusFilter]);

  const openReport = async (shift: Shift) => {
    setSelectedShift(shift);
    setDialogOpen(true);
    setReport(null);
    setReportLoading(true);
    try {
      const data = await apiClient<{ report: ShiftReportData }>(`/shifts/${shift.id}/report`);
      setReport(data.report);
    } catch {
      toast({
        title: "خطأ",
        description: "تعذر تحميل تقرير الوردية",
        variant: "destructive",
      });
      setDialogOpen(false);
    } finally {
      setReportLoading(false);
    }
  };

  const fmtMoney = (n: number | null | undefined) => `${Number(n ?? 0).toFixed(2)} ج`;

  return (
    <div className="flex flex-col h-full min-h-0 gap-3 antialiased" dir="rtl">
      <div className="shrink-0 px-1">
        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">إدارة الورديات</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">سجل فتح وإغلاق الورديات وتقاريرها</p>
      </div>

      <div className="sticky top-0 z-40 shrink-0 isolate rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-sm p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-[10px] font-bold text-slate-400">بحث</Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="اسم الموظف أو رقم الوردية..."
                className="h-10 pr-9 rounded-xl text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-400">الحالة</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 rounded-xl text-sm font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="open">مفتوحة</SelectItem>
                <SelectItem value="closed">مغلقة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain pb-1 space-y-2">
        {loading ? (
          <div className="min-h-[200px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredShifts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center text-sm font-bold text-slate-400">
            لا توجد ورديات
          </div>
        ) : (
          filteredShifts.map((shift) => (
            <button
              key={shift.id}
              type="button"
              onClick={() => openReport(shift)}
              className="w-full text-right rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      {shift.employee?.name || `موظف #${shift.employee_id}`}
                    </span>
                    <Badge variant={shift.status === "open" ? "default" : "secondary"} className="text-[10px]">
                      {shift.status === "open" ? "مفتوحة" : "مغلقة"}
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-400 mr-auto">#{shift.id}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs">
                    <div>
                      <span className="text-slate-400">الافتتاح: </span>
                      <span className="font-bold">{new Date(shift.opened_at).toLocaleString("ar-EG")}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">رصيد الافتتاح: </span>
                      <span className="font-bold">{fmtMoney(shift.opening_float)}</span>
                    </div>
                    {shift.closed_at && (
                      <div>
                        <span className="text-slate-400">الإغلاق: </span>
                        <span className="font-bold">{new Date(shift.closed_at).toLocaleString("ar-EG")}</span>
                      </div>
                    )}
                    {shift.expected_cash != null && (
                      <div>
                        <span className="text-slate-400">النقد المتوقع: </span>
                        <span className="font-bold">{fmtMoney(shift.expected_cash)}</span>
                      </div>
                    )}
                    {shift.actual_cash != null && (
                      <div>
                        <span className="text-slate-400">النقد الفعلي: </span>
                        <span className="font-bold">{fmtMoney(shift.actual_cash)}</span>
                      </div>
                    )}
                    {shift.cash_difference != null && (
                      <div>
                        <span className="text-slate-400">فرق النقد: </span>
                        <span className={`font-black ${shift.cash_difference < 0 ? "text-red-500" : "text-emerald-600"}`}>
                          {fmtMoney(shift.cash_difference)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
              </div>
            </button>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90dvh] flex flex-col rounded-2xl p-0 overflow-hidden" dir="rtl">
          <DialogHeader className="shrink-0 px-4 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="font-black text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              تقرير الوردية #{selectedShift?.id}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
            {reportLoading ? (
              <div className="min-h-[200px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : report ? (
              <div className="space-y-4">
                <div className="text-sm space-y-1">
                  <p className="font-black">{report.shift.employee?.name}</p>
                  <p className="text-slate-500 text-xs">
                    {new Date(report.shift.opened_at).toLocaleString("ar-EG")}
                    {report.shift.closed_at && ` — ${new Date(report.shift.closed_at).toLocaleString("ar-EG")}`}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: "صافي المبيعات", value: fmtMoney(report.summary.net_sales), color: "text-blue-600" },
                    { label: "عدد الفواتير", value: String(report.summary.invoice_count), color: "" },
                    { label: "ملغاة", value: String(report.summary.void_count), color: "text-red-500" },
                    { label: "رصيد الافتتاح", value: fmtMoney(report.shift.opening_float), color: "" },
                    { label: "النقد المتوقع", value: fmtMoney(report.summary.expected_cash), color: "" },
                    { label: "النقد الفعلي", value: fmtMoney(report.summary.actual_cash), color: "" },
                    {
                      label: "فرق النقد",
                      value: fmtMoney(report.summary.cash_difference),
                      color: Number(report.summary.cash_difference) < 0 ? "text-red-500" : "text-emerald-600",
                    },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                      <p className="text-[10px] font-bold text-slate-400">{item.label}</p>
                      <p className={`text-sm font-black ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-500 mb-2">فواتير الوردية ({report.invoices.length})</h4>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-slate-100 dark:bg-slate-800">
                        <tr>
                          {["الفاتورة", "التاريخ", "الإجمالي", "مرتجع", "الدفع"].map((h) => (
                            <th key={h} className="px-3 py-2 text-right text-xs font-black text-slate-600">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {report.invoices.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-3 py-6 text-center text-slate-400 text-xs">لا توجد فواتير</td>
                          </tr>
                        ) : (
                          report.invoices.map((inv, i) => (
                            <tr key={inv.id} className={i % 2 ? "bg-slate-50/80 dark:bg-slate-900/60" : ""}>
                              <td className="px-3 py-2 font-bold">{inv.invoice_number ?? `#${inv.id}`}</td>
                              <td className="px-3 py-2 text-xs">{inv.date} {inv.time ?? ""}</td>
                              <td className="px-3 py-2 font-black text-blue-600">{fmtMoney(inv.total)}</td>
                              <td className="px-3 py-2 text-red-500">{fmtMoney(inv.refund_amount)}</td>
                              <td className="px-3 py-2">{paymentLabels[inv.payment_method ?? ""] ?? inv.payment_method ?? "—"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {report && (
            <div className="shrink-0 px-4 py-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                className="w-full font-black rounded-xl gap-2"
                onClick={() => printShiftReport(report)}
              >
                <Printer className="w-4 h-4" />
                طباعة التقرير
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShiftReport;
