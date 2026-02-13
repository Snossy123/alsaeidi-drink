
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Calendar, Building, Package, Receipt, User, Clock, Trash2, ShoppingBag, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { API_BASE_URL } from "@/lib/constants";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface InvoiceItem {
  product_name: string;
  barcode: string;
  quantity: number;
  purchase_price: number;
  sale_price: number;
  category: string;
}

interface PurchaseInvoice {
  id: string;
  invoice_number: string;
  supplier: string;
  date: string;
  time: string;
  items: InvoiceItem[];
  total: number;
}

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


  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
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
    
    if (!invoiceData.invoice_number || !invoiceData.supplier || !invoiceData.date) {
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
      ...invoiceData,
      time: now.toTimeString().slice(0, 8),
      items: validItems,
      total: calculateTotal()
    };

    try {
      await saveInvoice(newInvoice);
      const updatedInvoices = await fetchInvoices();
      setInvoices(updatedInvoices.invoices);
      
      toast({
        title: "تم إضافة الفاتورة",
        description: `تم إضافة فاتورة الشراء ${invoiceData.invoice_number} بنجاح`,
      });

      setIsAddDialogOpen(false);
      setInvoiceData({ invoice_number: "", supplier: "", date: "" });
      setInvoiceItems([{ product_name: "", barcode: "", quantity: 0, purchase_price: 0, sale_price: 0, category: "" }]);
    } catch (error) {
      console.error(error);
      toast({
        title: "خطأ",
        description: "فشل حفظ الفاتورة، حاول مرة أخرى",
        variant: "destructive"
      });
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || "#6B7280";
  };

  return (
    <div className="space-y-6 antialiased" dir="rtl">
      {/* Premium Dashboard Header */}
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
              <p className="text-2xl font-black text-white">{invoices.length}</p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-16 px-8 rounded-2xl bg-purple-600 hover:bg-purple-500 shadow-xl shadow-purple-600/20 font-black text-white tracking-wide active:scale-95 transition-all text-base gap-3">
                  <Plus className="w-5 h-5" />
                  إرساء فاتورة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl p-0 overflow-hidden rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.3)]" dir="rtl">
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
                        value={invoiceData.invoice_number}
                        onChange={(e) => setInvoiceData({ ...invoiceData, invoice_number: e.target.value })}
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
                          value={invoiceData.supplier}
                          onChange={(e) => setInvoiceData({ ...invoiceData, supplier: e.target.value })}
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
                        value={invoiceData.date}
                        onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
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
                        <Card key={index} className="relative group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                          <div className="p-6 grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-5">
                            <div className="lg:col-span-3 space-y-1.5">
                              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">اسم المنتج</Label>
                              <Input
                                value={item.product_name}
                                onChange={(e) => updateInvoiceItem(index, 'product_name', e.target.value)}
                                className="h-11 bg-slate-50 dark:bg-slate-950 border-none rounded-xl font-bold text-sm"
                              />
                            </div>
                            <div className="lg:col-span-2 space-y-1.5">
                              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">الباركود</Label>
                              <Input
                                value={item.barcode}
                                onChange={(e) => updateInvoiceItem(index, 'barcode', e.target.value)}
                                className="h-11 bg-slate-50 dark:bg-slate-950 border-none rounded-xl font-bold text-sm"
                              />
                            </div>
                            <div className="lg:col-span-2 space-y-1.5">
                              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">الفئة</Label>
                              <Select 
                                value={item.category} 
                                onValueChange={(value) => updateInvoiceItem(index, 'category', value)}
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
                                onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 0)}
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
                                  onChange={(e) => updateInvoiceItem(index, 'purchase_price', parseFloat(e.target.value) || 0)}
                                  className="h-11 bg-purple-50 dark:bg-purple-900/20 border-none rounded-xl font-black text-purple-600 text-xs text-center"
                                />
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.sale_price}
                                  onChange={(e) => updateInvoiceItem(index, 'sale_price', parseFloat(e.target.value) || 0)}
                                  className="h-11 bg-emerald-50 dark:bg-emerald-900/20 border-none rounded-xl font-black text-emerald-600 text-xs text-center"
                                />
                              </div>
                            </div>
                            <div className="lg:col-span-1 flex items-end justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeInvoiceItem(index)}
                                className="h-11 w-11 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          </div>
                        </Card>
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
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="h-16 px-10 rounded-2xl border-slate-200 dark:border-slate-700 font-black text-slate-500 transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
                        إلغاء
                      </Button>
                      <Button type="submit" className="flex-1 md:flex-none h-16 px-12 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xl font-black text-lg transition-all active:scale-[0.98]">
                        حفظ الفاتورة النهائية
                      </Button>
                    </div>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {invoices.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
            <FileText className="w-16 h-16 text-slate-300 mb-4 opacity-50" />
            <p className="text-lg font-black text-slate-400">لا توجد سجلات مشتريات حتى الآن</p>
          </div>
        ) : (
          invoices.map((invoice) => (
            <Card 
              key={invoice.id} 
              className="group relative bg-white dark:bg-slate-900/50 backdrop-blur-xl border-none shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden rounded-[2.5rem] active:scale-[0.98]"
              onClick={() => {
                setSelectedInvoice(invoice);
                setIsInvoiceDialogOpen(true);
              }}
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
                    
                    <Button variant="ghost" className="h-10 px-4 rounded-xl text-xs font-black text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all gap-2 group-hover:translate-x-1 duration-300">
                      مراجعة البيانات
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Invoice Details Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.3)]" dir="rtl">
          <div className="bg-slate-900 p-8 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <DialogHeader className="text-right">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-purple-600 p-2.5 rounded-2xl shadow-lg">
                      <FileText className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="text-purple-400 border-purple-400/30 px-3 py-1 font-black">فاتورة تحصيل</Badge>
                  </div>
                  <DialogTitle className="text-3xl font-black tracking-tight">تفاصيل فاتورة المشتريات {selectedInvoice?.invoice_number}</DialogTitle>
                </DialogHeader>
              </div>
              
              <div className="text-left bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10 min-w-[200px]">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">إجمالي مشتريات الفاتورة</p>
                <div className="text-3xl font-black text-white">{Number(selectedInvoice?.total).toFixed(2)} <span className="text-sm">جنية</span></div>
              </div>
            </div>
          </div>
          
          <div className="p-8 space-y-8">
            {selectedInvoice && (
              <div className="space-y-8">
                {/* Meta Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "رقم المرجع", value: selectedInvoice.invoice_number, icon: Receipt, color: "text-blue-500" },
                    { label: "المورد", value: selectedInvoice.supplier, icon: Building, color: "text-purple-500" },
                    { label: "التاريخ", value: selectedInvoice.date, icon: Calendar, color: "text-emerald-500" },
                    { label: "وقت التسجيل", value: selectedInvoice.time, icon: Clock, color: "text-orange-500" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/50 group">
                      <div className="flex items-center gap-3 mb-2">
                        <stat.icon className={`w-4 h-4 ${stat.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{stat.label}</span>
                      </div>
                      <p className="font-black text-slate-800 dark:text-white truncate">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl">
                  <div className="p-6 border-b border-slate-50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                       <Package className="w-5 h-5 text-purple-500" />
                       المنتجات المضافة في هذه الفاتورة
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                        <TableRow className="border-slate-100 dark:border-slate-800">
                          <TableHead className="text-right py-5 px-6 font-black text-slate-500 text-xs uppercase">المنتج والباركود</TableHead>
                          <TableHead className="text-right py-5 px-4 font-black text-slate-500 text-xs uppercase">الفئة</TableHead>
                          <TableHead className="text-right py-5 px-4 font-black text-slate-500 text-xs uppercase">سعر الشراء</TableHead>
                          <TableHead className="text-right py-5 px-4 font-black text-slate-500 text-xs uppercase">سعر البيع</TableHead>
                          <TableHead className="text-center py-5 px-4 font-black text-slate-500 text-xs uppercase">الكمية</TableHead>
                          <TableHead className="text-left py-5 px-6 font-black text-slate-500 text-xs uppercase">الإجمالي</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.items.map((item, index) => (
                          <TableRow key={index} className="border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                            <TableCell className="py-5 px-6">
                              <div className="font-black text-slate-700 dark:text-slate-200">{item.product_name}</div>
                              <div className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-widest">{item.barcode}</div>
                            </TableCell>
                            <TableCell className="py-5 px-4">
                              {item.category && (
                                <Badge 
                                  className="text-white text-[10px] font-black px-2 shadow-sm border-none"
                                  style={{ backgroundColor: getCategoryColor(item.category) }}
                                >
                                  {item.category}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="py-5 px-4 font-bold text-purple-600">{Number(item.purchase_price).toFixed(2)} ج</TableCell>
                            <TableCell className="py-5 px-4 font-bold text-emerald-600">{Number(item.sale_price).toFixed(2)} ج</TableCell>
                            <TableCell className="py-5 px-4 text-center">
                              <Badge variant="outline" className="rounded-lg px-2 py-0.5 border-slate-200 dark:border-slate-800 font-black">{item.quantity}</Badge>
                            </TableCell>
                            <TableCell className="py-5 px-6 text-left font-black text-slate-800 dark:text-white">
                              {(Number(item.purchase_price) * item.quantity).toFixed(2)} <span className="text-[10px] text-slate-400">ج</span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => setIsInvoiceDialogOpen(false)} 
                    className="h-16 px-16 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xl font-black text-lg transition-all"
                  >
                    إغلاق المراجعة
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseInvoices;
