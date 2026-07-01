import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Calendar, Clock, Package, ChevronLeft } from "lucide-react";
import { PurchaseInvoice, getPurchaseInvoiceType, purchaseInvoiceTypeLabels } from "@/types/invoices";

interface PurchaseInvoiceCardProps {
  invoice: PurchaseInvoice;
  onClick: (invoice: PurchaseInvoice) => void;
}

const PurchaseInvoiceCard = ({ invoice, onClick }: PurchaseInvoiceCardProps) => {
  const type = getPurchaseInvoiceType(invoice);
  const isGeneral = type === "general";

  return (
    <Card
      className="group relative bg-white dark:bg-slate-900/50 backdrop-blur-xl border-none shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden rounded-[2.5rem] active:scale-[0.98]"
      onClick={() => onClick(invoice)}
    >
      <div
        className={`absolute top-0 right-0 w-full h-1 bg-gradient-to-l opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
          isGeneral ? "from-purple-600 to-blue-600" : "from-amber-500 to-orange-600"
        }`}
      />

      <CardContent className="p-7">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-purple-600/10 text-purple-600 dark:text-purple-400 hover:bg-purple-600/20 border-none font-black text-xs px-3 py-1 rounded-lg">
                {invoice.invoice_number}
              </Badge>
              <Badge
                className={`border-none font-black text-xs px-3 py-1 rounded-lg ${
                  isGeneral
                    ? "bg-purple-600/10 text-purple-600 dark:text-purple-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}
              >
                {purchaseInvoiceTypeLabels[type]}
              </Badge>
            </div>
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
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              {invoice.date}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              {invoice.time}
            </div>
            <div className="flex items-center gap-1.5 mr-auto">
              <Package className="w-3.5 h-3.5 text-purple-500" />
              {invoice.items.length} {isGeneral ? "منتج" : "مصروف"}
            </div>
          </div>

          <Button variant="ghost" className="w-full h-11 rounded-2xl font-black text-xs gap-2 group-hover:bg-purple-600/5 group-hover:text-purple-600">
            عرض التفاصيل
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseInvoiceCard;
