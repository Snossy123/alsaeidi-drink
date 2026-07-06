import { Receipt, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PurchaseInvoiceHeaderProps {
  invoiceCount: number;
  onAddClick: () => void;
}

const PurchaseInvoiceHeader = ({ invoiceCount, onAddClick }: PurchaseInvoiceHeaderProps) => {
  return (
    <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
      <div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">فواتير المشتريات</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">Acquisition & Supply Ledger</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2">
          <Receipt className="w-4 h-4 text-purple-600 shrink-0" />
          <div>
            <p className="text-[9px] font-bold text-slate-400 leading-none">الفواتير</p>
            <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">{invoiceCount}</p>
          </div>
        </div>
        <Button
          onClick={onAddClick}
          className="h-10 shrink-0 bg-purple-600 hover:bg-purple-500 font-bold text-sm px-4 rounded-xl gap-1.5"
        >
          <Plus className="w-4 h-4" />
          إرساء فاتورة جديدة
        </Button>
      </div>
    </div>
  );
};

export default PurchaseInvoiceHeader;
