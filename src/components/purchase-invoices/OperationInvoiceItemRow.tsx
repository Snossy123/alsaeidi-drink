import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { OperationExpenseItem } from "@/types/invoices";

interface OperationInvoiceItemRowProps {
  index: number;
  item: OperationExpenseItem;
  onUpdate: (index: number, field: keyof OperationExpenseItem, value: string | number) => void;
  onRemove: (index: number) => void;
}

const OperationInvoiceItemRow = ({
  index,
  item,
  onUpdate,
  onRemove,
}: OperationInvoiceItemRowProps) => {
  return (
    <Card className="relative group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-8 space-y-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">الوصف</Label>
          <Input
            value={item.description}
            onChange={(e) => onUpdate(index, "description", e.target.value)}
            placeholder="مثال: كهرباء، صيانة، إيجار..."
            className="h-11 bg-slate-50 dark:bg-slate-950 border-none rounded-xl font-bold text-sm"
          />
        </div>
        <div className="md:col-span-3 space-y-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">المبلغ</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={item.amount || ""}
            onChange={(e) => onUpdate(index, "amount", parseFloat(e.target.value) || 0)}
            className="h-11 bg-amber-50 dark:bg-amber-900/20 border-none rounded-xl font-black text-amber-600 text-sm"
          />
        </div>
        <div className="md:col-span-1 flex items-end justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="h-11 w-11 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default OperationInvoiceItemRow;
