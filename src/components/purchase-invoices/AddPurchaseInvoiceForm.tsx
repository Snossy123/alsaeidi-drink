import { useEffect, useState } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building, Package, Plus, Receipt } from "lucide-react";
import {
  Category,
  InvoiceItem,
  OperationExpenseItem,
  PurchaseInvoiceType,
  purchaseInvoiceTypeLabels,
} from "@/types/invoices";
import PurchaseInvoiceItemRow from "./PurchaseInvoiceItemRow";
import OperationInvoiceItemRow from "./OperationInvoiceItemRow";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";

interface AddPurchaseInvoiceFormProps {
  categories: Category[];
  onSubmit: (invoiceData: any) => Promise<void>;
  onCancel: () => void;
}

const emptyGeneralItem = (): InvoiceItem => ({
  product_name: "",
  barcode: "",
  quantity: 0,
  purchase_price: 0,
  sale_price: 0,
  category: "",
});

const emptyOperationItem = (): OperationExpenseItem => ({
  description: "",
  amount: 0,
});

const generateLocalInvoiceNumber = () => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const timePart = now.getTime().toString().slice(-4);
  return `PUR-${datePart}-${timePart}`;
};

const AddPurchaseInvoiceForm = ({ categories, onSubmit, onCancel }: AddPurchaseInvoiceFormProps) => {
  const { toast } = useToast();
  const [invoiceType, setInvoiceType] = useState<PurchaseInvoiceType>("general");
  const [invoiceNumber, setInvoiceNumber] = useState(generateLocalInvoiceNumber);
  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [generalItems, setGeneralItems] = useState<InvoiceItem[]>([emptyGeneralItem()]);
  const [operationItems, setOperationItems] = useState<OperationExpenseItem[]>([emptyOperationItem()]);

  useEffect(() => {
    let cancelled = false;

    const loadInvoiceNumber = async () => {
      try {
        const data = await apiClient<{ invoice_number: string }>("/purchase-invoices/next-number");
        if (!cancelled && data.invoice_number) {
          setInvoiceNumber(data.invoice_number);
        }
      } catch {
        if (!cancelled) {
          setInvoiceNumber(generateLocalInvoiceNumber());
        }
      }
    };

    loadInvoiceNumber();

    return () => {
      cancelled = true;
    };
  }, []);

  const isGeneral = invoiceType === "general";

  const addGeneralItem = () => setGeneralItems([...generalItems, emptyGeneralItem()]);
  const addOperationItem = () => setOperationItems([...operationItems, emptyOperationItem()]);

  const updateGeneralItem = (index: number, field: keyof InvoiceItem, value: any) => {
    setGeneralItems(generalItems.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const updateOperationItem = (index: number, field: keyof OperationExpenseItem, value: string | number) => {
    setOperationItems(operationItems.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const removeGeneralItem = (index: number) => {
    if (generalItems.length > 1) {
      setGeneralItems(generalItems.filter((_, i) => i !== index));
    }
  };

  const removeOperationItem = (index: number) => {
    if (operationItems.length > 1) {
      setOperationItems(operationItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    if (isGeneral) {
      return generalItems.reduce((total, item) => total + item.quantity * item.purchase_price, 0);
    }
    return operationItems.reduce((total, item) => total + item.amount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const resolvedInvoiceNumber = invoiceNumber.trim() || generateLocalInvoiceNumber();

    if (!supplier || !date) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع بيانات الفاتورة",
        variant: "destructive",
      });
      return;
    }

    let items: InvoiceItem[] = [];

    if (isGeneral) {
      items = generalItems.filter((item) => item.product_name && item.quantity > 0);
      if (items.length === 0) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إضافة منتج واحد على الأقل",
          variant: "destructive",
        });
        return;
      }
    } else {
      const validExpenses = operationItems.filter((item) => item.description && item.amount > 0);
      if (validExpenses.length === 0) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إضافة بند مصروف واحد على الأقل",
          variant: "destructive",
        });
        return;
      }
      items = validExpenses.map((item) => ({
        product_name: item.description,
        barcode: "",
        quantity: 1,
        purchase_price: item.amount,
        sale_price: 0,
        category: "",
      }));
    }

    const now = new Date();
    await onSubmit({
      invoice_number: resolvedInvoiceNumber,
      supplier,
      date,
      invoice_type: invoiceType,
      time: now.toTimeString().slice(0, 8),
      items,
      total: calculateTotal(),
    });
  };

  return (
    <div dir="rtl">
      <div className="bg-slate-900 p-8 text-white relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <DialogHeader className="text-right relative z-10">
          <DialogTitle className="text-3xl font-black tracking-tight">إضافة فاتورة شراء</DialogTitle>
          <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest">
            {isGeneral ? "General Stock Invoice" : "Operation Expense Invoice"}
          </p>
        </DialogHeader>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
          {(["general", "operation"] as PurchaseInvoiceType[]).map((type) => (
            <Button
              key={type}
              type="button"
              variant={invoiceType === type ? "default" : "ghost"}
              className={`flex-1 min-w-[140px] h-12 rounded-xl font-black ${
                invoiceType === type
                  ? type === "general"
                    ? "bg-purple-600 hover:bg-purple-500"
                    : "bg-amber-600 hover:bg-amber-500"
                  : ""
              }`}
              onClick={() => setInvoiceType(type)}
            >
              {purchaseInvoiceTypeLabels[type]}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-black text-slate-400 tracking-widest mr-2 uppercase">رقم الفاتورة</Label>
            <div
              aria-live="polite"
              className="h-14 bg-slate-100 dark:bg-slate-900/50 border-none rounded-2xl font-bold px-5 flex items-center text-slate-700 dark:text-slate-200"
            >
              {invoiceNumber || "جاري التوليد..."}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black text-slate-400 tracking-widest mr-2 uppercase">المورد</Label>
            <div className="relative">
              <Building className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="اسم الشركة أو المورد"
                className="h-14 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold px-5 pl-12"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black text-slate-400 tracking-widest mr-2 uppercase">تاريخ التحرير</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-14 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold px-5"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/50">
            <h3 className="text-md font-black text-slate-800 dark:text-white flex items-center gap-2">
              {isGeneral ? (
                <>
                  <Package className="w-5 h-5 text-purple-600" />
                  بنود المنتجات
                </>
              ) : (
                <>
                  <Receipt className="w-5 h-5 text-amber-600" />
                  بنود المصروفات
                </>
              )}
            </h3>
            <Button
              type="button"
              onClick={isGeneral ? addGeneralItem : addOperationItem}
              className={`h-10 px-4 rounded-xl border-none transition-all font-black text-xs gap-2 ${
                isGeneral
                  ? "bg-purple-600/10 text-purple-600 hover:bg-purple-600 hover:text-white"
                  : "bg-amber-600/10 text-amber-600 hover:bg-amber-600 hover:text-white"
              }`}
            >
              <Plus className="w-4 h-4" />
              {isGeneral ? "إضافة صنف جديد" : "إضافة مصروف"}
            </Button>
          </div>

          <div className="space-y-4 max-h-[40vh] sm:max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
            {isGeneral
              ? generalItems.map((item, index) => (
                  <PurchaseInvoiceItemRow
                    key={index}
                    index={index}
                    item={item}
                    categories={categories}
                    onUpdate={updateGeneralItem}
                    onRemove={removeGeneralItem}
                  />
                ))
              : operationItems.map((item, index) => (
                  <OperationInvoiceItemRow
                    key={index}
                    index={index}
                    item={item}
                    onUpdate={updateOperationItem}
                    onRemove={removeOperationItem}
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
            <Button type="button" variant="outline" onClick={onCancel} className="h-16 px-10 rounded-2xl font-black">
              إلغاء
            </Button>
            <Button type="submit" className="flex-1 md:flex-none h-16 px-12 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 font-black text-lg">
              حفظ الفاتورة النهائية
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPurchaseInvoiceForm;
