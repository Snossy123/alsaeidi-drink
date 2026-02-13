import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, FileText, Calendar, User, Printer, ChevronLeft, Package, Clock, ShoppingBag } from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
}

interface SaleInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  time: string;
  items: CartItem[];
  total: number;
  cashier: string;
}

const API_URL = API_BASE_URL;

const SalesInvoices = () => {
  const [invoices, setInvoices] = useState<SaleInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<SaleInvoice | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch(API_URL + "/sales-invoices");
        const data = await res.json();

        if (data.status === "success" && Array.isArray(data.invoices)) {
          setInvoices(data.invoices);
        } else {
          console.error("API Response Error:", data.message || "Unknown error");
        }
      } catch (error) {
        console.error("API Error:", error);
      }
    };

    fetchInvoices();
  }, []);

  return (
    <div className="space-y-6 antialiased" dir="rtl">
      {/* Premium Dashboard Header */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600/20 p-4 rounded-[2rem] shadow-inner backdrop-blur-md border border-white/10">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">سجل المبيعات</h1>
              <p className="text-blue-400/60 font-bold uppercase tracking-widest text-xs mt-1">Sales Ledger & History</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 px-6 min-w-[160px]">
              <div className="flex items-center gap-3 mb-1">
                <Receipt className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">إجمالي الفواتير</span>
              </div>
              <p className="text-2xl font-black text-white">{invoices.length}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 px-6 min-w-[200px]">
              <div className="flex items-center gap-3 mb-1">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">إجمالي المبيعات</span>
              </div>
              <p className="text-2xl font-black text-white">
                {invoices.reduce((sum, inv) => sum + Number(inv.total), 0).toLocaleString()} <span className="text-xs text-emerald-400">جنية</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {invoices.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
            <Receipt className="w-16 h-16 text-slate-300 mb-4 opacity-50" />
            <p className="text-lg font-black text-slate-400">لا توجد سجلات مبيعات حتى الآن</p>
          </div>
        ) : (
          invoices.map((invoice) => (
            <Card 
              key={invoice.id} 
              className="group relative bg-white dark:bg-slate-900/50 backdrop-blur-xl border-none shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden rounded-[2.5rem] active:scale-[0.98]"
              onClick={() => {
                setSelectedInvoice(invoice);
                setIsInvoiceDialogOpen(true);
              }}
            >
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardContent className="p-7">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <Badge className="bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 border-none font-black text-xs px-3 py-1 rounded-lg">
                      {invoice.invoiceNumber}
                    </Badge>
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                      <Package className="w-3 h-3" />
                      {invoice.items.length} منتجات مبيعة
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-black text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                      {Number(invoice.total).toFixed(2)}
                      <span className="text-xs mr-1 text-slate-400">ج</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      {invoice.date}
                    </div>
                    <div className="flex items-center gap-2 border-r pr-4 border-slate-200 dark:border-slate-800">
                      <Clock className="w-3.5 h-3.5 text-purple-500" />
                      {invoice.time}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-black text-slate-600 dark:text-slate-300">{invoice.cashier}</span>
                    </div>
                    
                    <Button variant="ghost" className="h-10 px-4 rounded-xl text-xs font-black text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all gap-2 group-hover:translate-x-1 duration-300">
                      طلب التفاصيل
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Premium Invoice Details Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.3)]" dir="rtl">
          <div className="bg-slate-900 p-8 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <DialogHeader className="text-right">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="text-blue-400 border-blue-400/30 px-3 py-1 font-black">مكتملة ✅</Badge>
                  </div>
                  <DialogTitle className="text-3xl font-black tracking-tight">تفاصيل الفاتورة {selectedInvoice?.invoiceNumber}</DialogTitle>
                </DialogHeader>
              </div>
              
              <div className="text-left bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10 min-w-[200px]">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">المبلغ الإجمالي</p>
                <div className="text-3xl font-black">{Number(selectedInvoice?.total).toFixed(2)} <span className="text-sm">جنية</span></div>
              </div>
            </div>
          </div>
          
          <div className="p-8 space-y-8">
            {selectedInvoice && (
              <div className="space-y-8">
                {/* Meta Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "رقم الفاتورة", value: selectedInvoice.invoiceNumber, icon: Receipt, color: "text-blue-500" },
                    { label: "التاريخ", value: selectedInvoice.date, icon: Calendar, color: "text-purple-500" },
                    { label: "الوقت", value: selectedInvoice.time, icon: Clock, color: "text-emerald-500" },
                    { label: "البائع", value: selectedInvoice.cashier, icon: User, color: "text-orange-500" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/50 group">
                      <div className="flex items-center gap-3 mb-2">
                        <stat.icon className={`w-4 h-4 ${stat.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{stat.label}</span>
                      </div>
                      <p className="font-black text-slate-800 dark:text-white truncate">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Items Table */}
                <div className="bg-white dark:bg-slate-950 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl">
                  <div className="p-6 border-b border-slate-50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white">قائمة المنتجات المبيعة</h3>
                    <Badge variant="outline" className="text-slate-400 font-bold border-slate-200 dark:border-slate-800">{selectedInvoice.items.length} صنف</Badge>
                  </div>
                  <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                      <TableRow className="border-slate-100 dark:border-slate-800">
                        <TableHead className="text-right py-5 px-6 font-black text-slate-500 text-xs uppercase uppercase">المنتج</TableHead>
                        <TableHead className="text-right py-5 px-4 font-black text-slate-500 text-xs uppercase">السعر</TableHead>
                        <TableHead className="text-center py-5 px-4 font-black text-slate-500 text-xs uppercase">الكمية</TableHead>
                        <TableHead className="text-left py-5 px-6 font-black text-slate-500 text-xs uppercase">الإجمالي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item, index) => (
                        <TableRow key={index} className="border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          <TableCell className="py-5 px-6 font-black text-slate-700 dark:text-slate-200">{item.name}</TableCell>
                          <TableCell className="py-5 px-4 font-bold text-slate-500">{Number(item.price).toFixed(2)} ج</TableCell>
                          <TableCell className="py-5 px-4 text-center">
                            <Badge variant="outline" className="rounded-lg px-2 py-0.5 border-slate-200 dark:border-slate-800 font-black">{item.quantity}</Badge>
                          </TableCell>
                          <TableCell className="py-5 px-6 text-left font-black text-blue-600 dark:text-blue-400">
                            {(item.price * item.quantity).toFixed(2)} <span className="text-[10px]">ج</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Final Actions */}
                <div className="flex gap-4 pt-4">
                  <Button className="flex-1 h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/20 font-black text-base gap-3 group">
                    <Printer className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    إعادة طباعة الفاتورة
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsInvoiceDialogOpen(false)} 
                    className="h-16 px-10 rounded-2xl border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400"
                  >
                    إغلاق النافذة
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesInvoices;
