import { ShoppingBag, Receipt, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";

interface PurchaseInvoiceHeaderProps {
  invoiceCount: number;
}

const PurchaseInvoiceHeader = ({ invoiceCount }: PurchaseInvoiceHeaderProps) => {
  return (
    <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-white/5">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-purple-600/20 p-4 rounded-[2rem] shadow-inner backdrop-blur-md border border-white/10">
            <ShoppingBag className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">فواتير المشتريات</h1>
            <p className="text-purple-400/60 font-bold uppercase tracking-widest text-xs mt-1">Acquisition & Supply Ledger</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 px-6 min-w-[120px]">
            <div className="flex items-center gap-3 mb-1">
              <Receipt className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">الفواتير</span>
            </div>
            <p className="text-2xl font-black text-white">{invoiceCount}</p>
          </div>
          
          <DialogTrigger asChild>
            <Button className="h-16 px-8 rounded-2xl bg-purple-600 hover:bg-purple-500 shadow-xl shadow-purple-600/20 font-black text-white tracking-wide active:scale-95 transition-all text-base gap-3">
              <Plus className="w-5 h-5" />
              إرساء فاتورة جديدة
            </Button>
          </DialogTrigger>
        </div>
      </div>
    </div>
  );
};

export default PurchaseInvoiceHeader;
