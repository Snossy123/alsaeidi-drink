
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/constants";
import { PurchaseInvoice, Category } from "@/types/invoices";

// Sub-components
import PurchaseInvoiceHeader from "./purchase-invoices/PurchaseInvoiceHeader";
import PurchaseInvoiceCard from "./purchase-invoices/PurchaseInvoiceCard";
import PurchaseInvoiceDetails from "./purchase-invoices/PurchaseInvoiceDetails";
import AddPurchaseInvoiceForm from "./purchase-invoices/AddPurchaseInvoiceForm";

const API_URL = API_BASE_URL;
const API_CATEGORIES_URL = API_BASE_URL + "/categories";

const saveInvoice = async (invoiceData: any) => {
  const response = await fetch(API_URL + '/purchase-invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoiceData)
  });

  if (!response.ok) throw new Error('فشل في حفظ الفاتورة');

  return await response.json();
};

const fetchInvoices = async () => {
  const response = await fetch(API_URL + '/purchase-invoices');
  if (!response.ok) throw new Error('فشل في جلب الفواتير');

  return await response.json();
};

const PurchaseInvoices = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const { toast } = useToast();

  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCategories] = await Promise.all([
          fetch(API_CATEGORIES_URL)
        ]);

        const categoriesData = await resCategories.json();
        setCategories(categoriesData.categories || []);
      } catch (error) {
        toast({
          title: "خطأ في الاتصال",
          description: "تعذر تحميل البيانات من الخادم",
          variant: "destructive"
        });
      }
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    fetchInvoices()
      .then((data) => setInvoices(data.invoices))
      .catch((error) => {
        console.error(error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء تحميل الفواتير",
          variant: "destructive"
        });
      });
  }, [toast]);

  const handleInvoiceSubmit = async (newInvoice: any) => {
    try {
      await saveInvoice(newInvoice);
      const updatedInvoices = await fetchInvoices();
      setInvoices(updatedInvoices.invoices);
      
      toast({
        title: "تم إضافة الفاتورة",
        description: `تم إضافة فاتورة الشراء ${newInvoice.invoice_number} بنجاح`,
      });

      setIsAddDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "خطأ",
        description: "فشل حفظ الفاتورة، حاول مرة أخرى",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6 antialiased" dir="rtl">
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <PurchaseInvoiceHeader invoiceCount={invoices.length} />
        
        <DialogContent className="max-w-6xl p-0 overflow-hidden rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.3)]" dir="rtl">
          <AddPurchaseInvoiceForm 
            categories={categories} 
            onSubmit={handleInvoiceSubmit}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Grid List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {invoices.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
            <FileText className="w-16 h-16 text-slate-300 mb-4 opacity-50" />
            <p className="text-lg font-black text-slate-400">لا توجد سجلات مشتريات حتى الآن</p>
          </div>
        ) : (
          invoices.map((invoice) => (
            <PurchaseInvoiceCard 
              key={invoice.id} 
              invoice={invoice} 
              onClick={(inv) => {
                setSelectedInvoice(inv);
                setIsInvoiceDialogOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Invoice Details Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.3)]" dir="rtl">
          <div className="bg-slate-900 p-8 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-600 p-2.5 rounded-2xl shadow-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="bg-purple-600/10 text-purple-400 border border-purple-400/30 px-3 py-1 font-black text-xs rounded-full">فاتورة تحصيل</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight">تفاصيل فاتورة المشتريات {selectedInvoice?.invoice_number}</h2>
              </div>
              
              <div className="text-left bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10 min-w-[200px]">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">إجمالي مشتريات الفاتورة</p>
                <div className="text-3xl font-black text-white">{Number(selectedInvoice?.total).toFixed(2)} <span className="text-sm">جنية</span></div>
              </div>
            </div>
          </div>
          
          {selectedInvoice && (
            <PurchaseInvoiceDetails 
              invoice={selectedInvoice} 
              categories={categories} 
              onClose={() => setIsInvoiceDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseInvoices;
