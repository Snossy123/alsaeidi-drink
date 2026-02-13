import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Calendar, Clock, Package, ChevronLeft } from "lucide-react";
import { PurchaseInvoice } from "@/types/invoices";

interface PurchaseInvoiceCardProps {
  invoice: PurchaseInvoice;
  onClick: (invoice: PurchaseInvoice) => void;
}

const PurchaseInvoiceCard = ({ invoice, onClick }: PurchaseInvoiceCardProps) => {
  return (
    <Card 
      className="group relative bg-white dark:bg-slate-900/50 backdrop-blur-xl border-none shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden rounded-[2.5rem] active:scale-[0.98]"
      onClick={() => onClick(invoice)}
    >
      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="p-7">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <Badge className="bg-purple-600/10 text-purple-600 dark:text-purple-400 hover:bg-purple-600/20 border-none font-black text-xs px-3 py-1 rounded-lg">
              {invoice.invoice_number}
            </Badge>
            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
              <Building className="w-3 h-3 text-purple-500" />
              {invoice.supplier}
            </div>
          </div>
          <div className="text-left">
            <div className="text-2xl font-black text-slate-800 dark:text-white group-hover:text-purple-600 transition-colors">
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
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Package className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-slate-500">{invoice.items.length} صنف مسجل</span>
            </div>
            
            <button className="h-10 px-4 rounded-xl text-xs font-black text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-2 group-hover:translate-x-1 duration-300">
              مراجعة البيانات
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseInvoiceCard;
