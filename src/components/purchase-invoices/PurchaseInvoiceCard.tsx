import { Badge } from "@/components/ui/badge";
import { Building, Calendar, Clock, Package, ChevronLeft } from "lucide-react";
import { PurchaseInvoice, getPurchaseInvoiceType, purchaseInvoiceTypeLabels } from "@/types/invoices";
import { cn } from "@/lib/utils";

interface PurchaseInvoiceCardProps {
  invoice: PurchaseInvoice;
  onClick: (invoice: PurchaseInvoice) => void;
}

const PurchaseInvoiceCard = ({ invoice, onClick }: PurchaseInvoiceCardProps) => {
  const type = getPurchaseInvoiceType(invoice);
  const isGeneral = type === "general";

  return (
    <button
      type="button"
      className={cn(
        "w-full text-right rounded-xl border bg-white dark:bg-slate-900 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition-all active:scale-[0.995]",
        isGeneral
          ? "border-slate-200 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-800"
          : "border-slate-200 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-800"
      )}
      onClick={() => onClick(invoice)}
    >
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge
            className={cn(
              "text-[10px] font-black h-5 px-2 border-none",
              isGeneral
                ? "bg-purple-600/10 text-purple-600 dark:text-purple-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            )}
          >
            {purchaseInvoiceTypeLabels[type]}
          </Badge>
          <Badge variant="outline" className="text-[10px] font-black h-5 px-2">
            {invoice.items.length} {isGeneral ? "منتج" : "مصروف"}
          </Badge>
        </div>
        <h3 className="font-black text-base text-slate-800 dark:text-slate-100 truncate">{invoice.invoice_number}</h3>
        <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" />{invoice.supplier}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{invoice.date}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{invoice.time}</span>
          <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" />{invoice.items.length}</span>
        </div>
      </div>
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
        <p className={cn(
          "text-xl font-black tabular-nums",
          isGeneral ? "text-purple-600 dark:text-purple-400" : "text-amber-600 dark:text-amber-400"
        )}>
          {Number(invoice.total).toFixed(2)} <span className="text-xs">ج</span>
        </p>
        <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
          التفاصيل <ChevronLeft className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
};

export default PurchaseInvoiceCard;
