import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Receipt, Building, Calendar, Clock, Package } from "lucide-react";
import { PurchaseInvoice, Category } from "@/types/invoices";

interface PurchaseInvoiceDetailsProps {
  invoice: PurchaseInvoice;
  categories: Category[];
  onClose: () => void;
}

const PurchaseInvoiceDetails = ({ invoice, categories, onClose }: PurchaseInvoiceDetailsProps) => {
  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || "#6B7280";
  };

  return (
    <div className="space-y-8 p-8" dir="rtl">
      {/* Meta Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "رقم المرجع", value: invoice.invoice_number, icon: Receipt, color: "text-blue-500" },
          { label: "المورد", value: invoice.supplier, icon: Building, color: "text-purple-500" },
          { label: "التاريخ", value: invoice.date, icon: Calendar, color: "text-emerald-500" },
          { label: "وقت التسجيل", value: invoice.time, icon: Clock, color: "text-orange-500" },
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

      <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
          <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
             <Package className="w-5 h-5 text-purple-500" />
             المنتجات المضافة في هذه الفاتورة
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow className="border-slate-100 dark:border-slate-800">
                <TableHead className="text-right py-5 px-6 font-black text-slate-500 text-xs uppercase">المنتج والباركود</TableHead>
                <TableHead className="text-right py-5 px-4 font-black text-slate-500 text-xs uppercase">الفئة</TableHead>
                <TableHead className="text-right py-5 px-4 font-black text-slate-500 text-xs uppercase">سعر الشراء</TableHead>
                <TableHead className="text-right py-5 px-4 font-black text-slate-500 text-xs uppercase">سعر البيع</TableHead>
                <TableHead className="text-center py-5 px-4 font-black text-slate-500 text-xs uppercase">الكمية</TableHead>
                <TableHead className="text-left py-5 px-6 font-black text-slate-500 text-xs uppercase">الإجمالي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index} className="border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <TableCell className="py-5 px-6">
                    <div className="font-black text-slate-700 dark:text-slate-200">{item.product_name}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-widest">{item.barcode}</div>
                  </TableCell>
                  <TableCell className="py-5 px-4">
                    {item.category && (
                      <Badge 
                        className="text-white text-[10px] font-black px-2 shadow-sm border-none"
                        style={{ backgroundColor: getCategoryColor(item.category) }}
                      >
                        {item.category}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-5 px-4 font-bold text-purple-600">{Number(item.purchase_price).toFixed(2)} ج</TableCell>
                  <TableCell className="py-5 px-4 font-bold text-emerald-600">{Number(item.sale_price).toFixed(2)} ج</TableCell>
                  <TableCell className="py-5 px-4 text-center">
                    <Badge variant="outline" className="rounded-lg px-2 py-0.5 border-slate-200 dark:border-slate-800 font-black">{item.quantity}</Badge>
                  </TableCell>
                  <TableCell className="py-5 px-6 text-left font-black text-slate-800 dark:text-white">
                    {(Number(item.purchase_price) * item.quantity).toFixed(2)} <span className="text-[10px] text-slate-400">ج</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={onClose} 
          className="h-16 px-16 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xl font-black text-lg transition-all"
        >
          إغلاق المراجعة
        </Button>
      </div>
    </div>
  );
};

export default PurchaseInvoiceDetails;
