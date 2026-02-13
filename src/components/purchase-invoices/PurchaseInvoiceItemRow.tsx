import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { InvoiceItem, Category } from "@/types/invoices";

interface PurchaseInvoiceItemRowProps {
  index: number;
  item: InvoiceItem;
  categories: Category[];
  onUpdate: (index: number, field: keyof InvoiceItem, value: any) => void;
  onRemove: (index: number) => void;
}

const PurchaseInvoiceItemRow = ({ 
  index, 
  item, 
  categories, 
  onUpdate, 
  onRemove 
}: PurchaseInvoiceItemRowProps) => {
  return (
    <Card className="relative group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      <div className="p-6 grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-3 space-y-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">اسم المنتج</Label>
          <Input
            value={item.product_name}
            onChange={(e) => onUpdate(index, 'product_name', e.target.value)}
            className="h-11 bg-slate-50 dark:bg-slate-950 border-none rounded-xl font-bold text-sm"
          />
        </div>
        <div className="lg:col-span-2 space-y-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">الباركود</Label>
          <Input
            value={item.barcode}
            onChange={(e) => onUpdate(index, 'barcode', e.target.value)}
            className="h-11 bg-slate-50 dark:bg-slate-950 border-none rounded-xl font-bold text-sm"
          />
        </div>
        <div className="lg:col-span-2 space-y-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">الفئة</Label>
          <Select 
            value={item.category} 
            onValueChange={(value) => onUpdate(index, 'category', value)}
          >
            <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-950 border-none rounded-xl font-bold text-sm">
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name} className="font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="lg:col-span-1 space-y-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">الكمية</Label>
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) => onUpdate(index, 'quantity', parseInt(e.target.value) || 0)}
            className="h-11 bg-slate-50 dark:bg-slate-950 border-none rounded-xl font-black text-center"
          />
        </div>
        <div className="lg:col-span-2 lg:col-start-9 lg:col-end-11 space-y-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">شراء / بيع</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.01"
              value={item.purchase_price}
              onChange={(e) => onUpdate(index, 'purchase_price', parseFloat(e.target.value) || 0)}
              className="h-11 bg-purple-50 dark:bg-purple-900/20 border-none rounded-xl font-black text-purple-600 text-xs text-center"
            />
            <Input
              type="number"
              step="0.01"
              value={item.sale_price}
              onChange={(e) => onUpdate(index, 'sale_price', parseFloat(e.target.value) || 0)}
              className="h-11 bg-emerald-50 dark:bg-emerald-900/20 border-none rounded-xl font-black text-emerald-600 text-xs text-center"
            />
          </div>
        </div>
        <div className="lg:col-span-1 flex items-end justify-end">
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

export default PurchaseInvoiceItemRow;
