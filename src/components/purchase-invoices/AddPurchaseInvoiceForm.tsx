import { useState } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building, Package, Plus } from "lucide-react";
import { Category, InvoiceItem } from "@/types/invoices";
import PurchaseInvoiceItemRow from "./PurchaseInvoiceItemRow";
import { useToast } from "@/hooks/use-toast";

interface AddPurchaseInvoiceFormProps {
  categories: Category[];
  onSubmit: (invoiceData: any) => Promise<void>;
  onCancel: () => void;
}

const AddPurchaseInvoiceForm = ({ categories, onSubmit, onCancel }: AddPurchaseInvoiceFormProps) => {
  const { toast } = useToast();
  const [invoiceInfo, setInvoiceInfo] = useState({
    invoice_number: "",
    supplier: "",
    date: ""
  });
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { product_name: "", barcode: "", quantity: 0, purchase_price: 0, sale_price: 0, category: "" }
  ]);

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { product_name: "", barcode: "", quantity: 0, purchase_price: 0, sale_price: 0, category: "" }]);
  };

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = invoiceItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setInvoiceItems(updatedItems);
  };

  const removeInvoiceItem = (index: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return invoiceItems.reduce((total, item) => total + (item.quantity * item.purchase_price), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invoiceInfo.invoice_number || !invoiceInfo.supplier || !invoiceInfo.date) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع بيانات الفاتورة",
        variant: "destructive"
      });
      return;
    }

    const validItems = invoiceItems.filter(item => item.product_name && item.quantity > 0);
    
    if (validItems.length === 0) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إضافة منتج واحد على الأقل",
        variant: "destructive"
      });
      return;
    }

    const now = new Date();
    const newInvoice = {
      ...invoiceInfo,
      time: now.toTimeString().slice(0, 8),
      items: validItems,
      total: calculateTotal()
    };

    await onSubmit(newInvoice);
  };

  return (
    <div dir="rtl">
      <div className="bg-slate-900 p-8 text-white relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <DialogHeader className="text-right relative z-10">
          <DialogTitle className="text-3xl font-black tracking-tight">إضافة فاتورة شراء</DialogTitle>
          <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest">Registering New Supply Invoice</p>
        </DialogHeader>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-black text-slate-400 tracking-widest mr-2 uppercase">رقم الفاتورة</Label>
            <Input
              value={invoiceInfo.invoice_number}
              onChange={(e) => setInvoiceInfo({ ...invoiceInfo, invoice_number: e.target.value })}
              placeholder="مثال: INV-2024-001"
              className="h-14 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold px-5 focus-visible:ring-2 focus-visible:ring-purple-500/20"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black text-slate-400 tracking-widest mr-2 uppercase">المورد</Label>
            <div className="relative">
              <Building className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={invoiceInfo.supplier}
                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, supplier: e.target.value })}
                placeholder="اسم الشركة أو المورد"
                className="h-14 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold px-5 pl-12 focus-visible:ring-2 focus-visible:ring-purple-500/20"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black text-slate-400 tracking-widest mr-2 uppercase">تاريخ التحرير</Label>
            <Input
              type="date"
              value={invoiceInfo.date}
              onChange={(e) => setInvoiceInfo({ ...invoiceInfo, date: e.target.value })}
              className="h-14 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold px-5 focus-visible:ring-2 focus-visible:ring-purple-500/20"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/50">
            <h3 className="text-md font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              بنود المنتجات التحصيلية
            </h3>
            <Button type="button" onClick={addInvoiceItem} className="h-10 px-4 rounded-xl bg-purple-600/10 text-purple-600 hover:bg-purple-600 hover:text-white border-none transition-all font-black text-xs gap-2">
              <Plus className="w-4 h-4" />
              إضافة صنف جديد
            </Button>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
            {invoiceItems.map((item, index) => (
              <PurchaseInvoiceItemRow
                key={index}
                index={index}
                item={item}
                categories={categories}
                onUpdate={updateInvoiceItem}
                onRemove={removeInvoiceItem}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-900 dark:bg-black/40 p-5 px-8 rounded-3xl flex items-center gap-8 shadow-xl">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">إجمالي الفاتورة</span>
              <p className="text-xs text-purple-400 font-bold italic">Total Payable Amount</p>
            </div>
            <div className="text-left">
              <span className="text-3xl font-black text-white tracking-tighter block">{calculateTotal().toFixed(2)}</span>
              <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest block text-left">جنيه مصري</span>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <Button type="button" variant="outline" onClick={onCancel} className="h-16 px-10 rounded-2xl border-slate-200 dark:border-slate-700 font-black text-slate-500 transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
              إلغاء
            </Button>
            <Button type="submit" className="flex-1 md:flex-none h-16 px-12 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xl font-black text-lg transition-all active:scale-[0.98]">
              حفظ الفاتورة النهائية
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPurchaseInvoiceForm;
