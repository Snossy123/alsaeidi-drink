import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Barcode, Plus, Minus, Trash2, Printer, Receipt, ChevronLeft, ChevronRight, Package, Calculator, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import CategoriesSidebar from "./CategoriesSidebar";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
  size?: "s" | "m" | "l" | null;
}

const API_URL = API_BASE_URL;

const SalesInterface = () => {
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [kitchenNote, setKitchenNote] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes, employeesRes] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/employees`)
        ]);

        const [productsData, categoriesData, employeesData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
          employeesRes.json()
        ]);

        if (productsData.status === "success") setProducts(productsData.products);
        if (categoriesData.status === "success") setCategories(categoriesData.categories);
        if (employeesData.status === "success") setEmployees(employeesData.employees);

      } catch (error: any) {
        toast({
          title: "فشل التحميل",
          description: error.message || "تحقق من الاتصال بالإنترنت",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);


  const addToCart = (product: any, size: string | null = null) => {
    const price = Number(product.price);
    const existingItem = cart.find(
      (item) => item.id === product.id && item.price === price && item.size === size
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id && item.price === price && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, price, quantity: 1, size }]);
    }

    toast({
      title: "تم إضافة المنتج",
      description: `تم إضافة ${product.name} إلى السلة`,
    });
  };

  const updateQuantity = (id: string, newQuantity: number, price: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item =>
        (item.id === id && item.price === price) ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (id: string, price: number) => {
    setCart(cart.filter(item => (item.id !== id && item.price !== price)));
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.barcode === barcode);
    setBarcode("");

    if (!product) {
      toast({
        title: "المنتج غير موجود",
        description: "لم يتم العثور على منتج بهذا الباركود",
        variant: "destructive"
      });
      return;
    }

    // 🟦 If the product has sizes, open the same size dialog as when clicked
    if (product.hasSizes) {
      setSelectedProduct(product);
      setShowSizeDialog(true);
    } else {
      // Otherwise, add normally
      addToCart({ ...product, price: product.price });
    }
  };


  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };


  // ✅ فتح نافذة اختيار الموظف قبل الحفظ
  const openEmployeeDialog = () => {
    if (cart.length === 0) {
      toast({
        title: "السلة فارغة",
        description: "يرجى إضافة منتجات إلى السلة أولاً",
        variant: "destructive"
      });
      return;
    }
    console.log("Opening employee dialog...", employees);
    setShowEmployeeDialog(true);
  };

  // ✅ عند تأكيد اختيار الموظف يتم الحفظ فعليًا
  const handleCheckout = async () => {
    if (!selectedEmployee) {
      toast({
        title: "لم يتم اختيار الموظف",
        description: "يرجى اختيار الموظف المسؤول قبل إتمام العملية",
        variant: "destructive"
      });
      return;
    }

    const now = new Date();
    const invoiceNumber = `INV-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${now.getTime().toString().slice(-4)}`;
    const invoiceData = {
      invoiceNumber,
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 8),
      employee_id: selectedEmployee,
      total: calculateTotal(),
      items: cart,
      kitchen_note: kitchenNote,
    };

    try {
      const res = await fetch(`${API_URL}/sales-invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData)
      });

      const result = await res.json();

      if (result.status === "success") {
        // Print both copies
        printInvoice(invoiceData, false); // نسخة الزبون
        printInvoice(invoiceData, true);  // نسخة المطبخ

        toast({
          title: "تمت عملية البيع بنجاح ✅",
          description: `رقم الفاتورة: ${invoiceNumber} - المبلغ: ${calculateTotal().toFixed(2)} جنية`,
        });
        setCart([]);
        setSelectedEmployee("");
        setShowEmployeeDialog(false);
      } else {
        toast({
          title: "فشل حفظ الفاتورة",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر حفظ الفاتورة. حاول لاحقًا",
        variant: "destructive"
      });
    }
  };


  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!selectedCategory || product.category_id === selectedCategory)
  );

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showSizeDialog, setShowSizeDialog] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 3 * 3 grid

  // Reset to page 1 when searching
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Pagination Calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleProductClick = (product: any) => {
    if (product.hasSizes) {
      setSelectedProduct(product);
      setShowSizeDialog(true);
    } else {
      addToCart({ ...product, price: product.price });
    }
  };

  const handleSelectSize = (size: "s" | "m" | "l") => {
    if (!selectedProduct) return;

    const price =
      size === "s"
        ? selectedProduct.s_price
        : size === "m"
          ? selectedProduct.m_price
          : selectedProduct.l_price;

    addToCart({ ...selectedProduct, price }, size);
    setShowSizeDialog(false);
    setSelectedProduct(null);
  };

  // 🖨️ طباعة الفاتورة - توافق مع طابعات 80 مم
  const printInvoice = (invoiceData: any, isKitchenCopy = false) => {
    const printWindow = window.open("", "_blank", "width=400,height=600");

    const employee = employees.find(e => e.id === Number(invoiceData.employee_id));
    const cashierName = employee ? employee.name : "غير محدد";

    // تحويل الرموز إلى كلمات عربية للطباعة
    const sizeMap: any = { s: "صغير", m: "وسط", l: "كبير" };

    const html = `
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { 
              font-family: 'Arial', sans-serif; 
              width: 72mm; /* ترك هامش بسيط للحواف */
              margin: 0 auto; 
              padding: 5mm 2mm;
              font-size: 12px;
              line-height: 1.4;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .header-title { font-size: 16px; margin-bottom: 5px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
            .info-table { width: 100%; margin: 5px 0; font-size: 11px; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .items-table th { border-bottom: 1px solid #000; text-align: right; padding: 4px 0; }
            .items-table td { padding: 5px 0; vertical-align: top; border-bottom: 0.5px solid #eee; }
            .total-section { margin-top: 10px; padding-top: 5px; border-top: 1px dashed #000; }
            .kitchen-note { 
              background: #000; color: #fff; padding: 5px; 
              margin-top: 10px; text-align: center; font-size: 14px; 
            }
            .footer { margin-top: 15px; font-size: 10px; border-top: 1px solid #000; padding-top: 5px; }
            .divider { border-top: 1px dashed #000; margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="center bold header-title">
            ${isKitchenCopy ? "طلب مطبخ - Kitchen" : "فاتورة مبيعات"}
          </div>
          
          <table class="info-table">
            <tr><td>رقم الفاتورة:</td><td class="bold text-left">${invoiceData.invoiceNumber}</td></tr>
            <tr><td>التاريخ:</td><td class="text-left">${invoiceData.date} ${invoiceData.time}</td></tr>
            <tr><td>الكاشير:</td><td class="text-left">${cashierName}</td></tr>
          </table>
          
          ${isKitchenCopy && invoiceData.kitchen_note
        ? `<div class="kitchen-note bold">⚠️ ملاحظة: ${invoiceData.kitchen_note}</div>`
        : ""
      }

          <table class="items-table">
            <thead>
              <tr>
                <th width="45%">المنتج</th>
                <th width="15%">سعر</th>
                <th width="15%">كمية</th>
                <th width="25%" style="text-align:left">إجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData.items.map((item: any) => `
                <tr>
                  <td>
                    <span class="bold">${item.name}</span>
                    ${item.size ? `<br/><small>(${sizeMap[item.size] || item.size})</small>` : ""}
                  </td>
                  <td>${item.price}</td>
                  <td class="center">${item.quantity}</td>
                  <td style="text-align:left" class="bold">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="total-section">
            <div style="display: flex; justify-content: space-between; font-size: 16px;" class="bold">
              <span>الإجمالي النهائي:</span>
              <span>${invoiceData.total.toFixed(2)} ج</span>
            </div>
          </div>

          <div class="center footer">
            ${isKitchenCopy ? "--- نسخة المطبخ ---" : "شكراً لزيارتكم! نرجو رؤيتكم قريباً"}
            <br/>
            ${new Date().toLocaleString('ar-EG')}
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 500);
            }
          </script>
        </body>
      </html>
    `;

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  return (
    <div className="flex flex-row-reverse gap-6 h-[calc(100vh-40px)] p-4 antialiased overflow-hidden bg-slate-50 dark:bg-slate-950" dir="rtl">

      {/* 1. Right Column: Categories (Refined) */}
      <div className="shrink-0">
        <CategoriesSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>

      {/* 2. Center Column: Barcode & Products */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">

        {/* Premium Barcode & Title Area */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex items-center gap-3 px-4 shrink-0 border-l border-white/10 ml-2">
            <div className="bg-blue-600/20 p-2.5 rounded-2xl shadow-inner">
              <Calculator className="w-5 h-5 text-blue-400" />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-lg font-black text-white leading-tight">نقطة البيع</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">السوق المركزي</p>
            </div>
          </div>

          <form onSubmit={handleBarcodeSubmit} className="flex-1 flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 focus-within:border-blue-500/50 transition-all">
            <div className="flex items-center gap-2 pr-3 text-slate-400 group">
              <Barcode className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
            </div>

            <Input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="امسح الباركود أو ادخل الرقم يدوياً..."
              className="flex-1 font-bold text-sm h-11 bg-transparent border-none text-white placeholder:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />

            <Button
              type="submit"
              size="sm"
              className="h-11 px-8 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all ml-1"
            >
              إضافة
            </Button>
          </form>
        </div>

        {/* Product Grid Area */}
        <div className="flex-1 flex flex-col bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600/5 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
          
          <CardHeader className="py-5 px-8 shrink-0 relative z-10 border-b border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600/10 p-2 rounded-xl">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl font-black text-slate-800 dark:text-white">قائمة المنتجات</CardTitle>
              </div>
              
              <div className="relative w-72 group">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="بحث سريع باسم المنتج..."
                  className="h-11 pr-10 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-500/20 font-bold transition-all"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6 relative z-10 scrollbar-hide">
            {paginatedProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
                <Package className="w-20 h-20 mb-4" />
                <p className="text-xl font-black">لا توجد منتجات</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative bg-white dark:bg-slate-800 border-none rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer active:scale-[0.98]"
                    onClick={() => handleProductClick(product)}
                  >
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors duration-500" />
                    
                    {/* Image Holder */}
                    <div className="aspect-[4/3] w-full bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center group-hover:p-4 transition-all duration-500">
                      {product.image ? (
                        <img
                          src={"https://greensolar-power.com/POS-API/" + product.image}
                          alt={product.name}
                          className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <Package className="w-12 h-12 text-slate-200 dark:text-slate-800" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col gap-4">
                      <div className="space-y-1">
                        <h3 className="font-black text-slate-700 dark:text-slate-100 text-sm leading-tight group-hover:text-blue-600 transition-colors truncate">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,44,44,0.5)]'}`} />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            {product.stock > 0 ? `متاح: ${product.stock}` : 'نفذ الكمية'}
                          </span>
                        </div>
                      </div>

                      {product.hasSizes ? (
                        <div className="grid grid-cols-3 gap-2">
                          {/* S */}
                          <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-950/50 py-2 rounded-xl group/size hover:bg-blue-600 transition-colors duration-300">
                            <span className="text-[9px] font-black text-slate-400 group-hover/size:text-blue-100 uppercase mb-0.5">ص</span>
                            <span className="text-xs font-black text-slate-800 dark:text-white group-hover/size:text-white">{product.s_price}ج</span>
                          </div>
                          {/* M */}
                          <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-950/50 py-2 rounded-xl group/size hover:bg-purple-600 transition-colors duration-300">
                            <span className="text-[9px] font-black text-slate-400 group-hover/size:text-purple-100 uppercase mb-0.5">و</span>
                            <span className="text-xs font-black text-slate-800 dark:text-white group-hover/size:text-white">{product.m_price}ج</span>
                          </div>
                          {/* L */}
                          <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-950/50 py-2 rounded-xl group/size hover:bg-emerald-600 transition-colors duration-300">
                            <span className="text-[9px] font-black text-slate-400 group-hover/size:text-emerald-100 uppercase mb-0.5">ك</span>
                            <span className="text-xs font-black text-slate-800 dark:text-white group-hover/size:text-white">{product.l_price}ج</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-blue-600/10 py-3 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-all duration-300">
                          <span className="text-blue-700 dark:text-blue-400 font-black text-sm group-hover:text-white">
                            {product.price} جنيه
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          {/* Premium Pagination Footer */}
          <CardFooter className="py-5 px-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0 bg-slate-50/50 dark:bg-slate-950/50 relative z-10">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-md hover:shadow-lg active:scale-90 transition-all text-slate-400 disabled:opacity-30"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-4">
              <div className="h-1 w-24 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500" 
                  style={{ width: `${(currentPage / (totalPages || 1)) * 100}%` }}
                />
              </div>
              <span className="text-xs font-black text-slate-500">
                صفحة {currentPage} من {totalPages || 1}
              </span>
            </div>

            <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-md hover:shadow-lg active:scale-90 transition-all text-slate-400 disabled:opacity-30"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </CardFooter>
        </div>
      </div>

      {/* 3. Left Column: Cart (Premium Overhaul) */}
      <div className="w-80 shrink-0 h-full relative">
        <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-full translate-y-1/2" />
        
        <Card className="h-full flex flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/20 dark:border-slate-800 shadow-2xl rounded-[2.5rem] overflow-hidden relative z-10">

          {/* Cart Header */}
          <CardHeader className="py-6 px-6 border-b border-slate-100 dark:border-slate-800/50 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-sm font-black text-slate-800 dark:text-white">الفاتورة الحالية</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{cart.length} أصناف في السلة</p>
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Cart Items */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 gap-4 opacity-50">
                <div className="w-16 h-16 rounded-full border-4 border-dashed border-current flex items-center justify-center">
                  <Receipt className="w-8 h-8" />
                </div>
                <p className="text-sm font-black italic">السلة فارغة حالياً</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.id}-${item.price}`}
                  className="group bg-white/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-black text-sm text-slate-700 dark:text-slate-200 truncate leading-tight group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </h4>
                      {item.size && (
                        <Badge variant="outline" className="text-[9px] font-black h-4 px-1.5 border-blue-200 text-blue-600 bg-blue-50/50">
                          {item.size === 's' ? 'صغير' : item.size === 'm' ? 'وسط' : 'كبير'}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                      onClick={() => removeFromCart(item.id, item.price)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200/50 dark:border-slate-700/50">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-500"
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.price)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-xs font-black min-w-[20px] text-center text-slate-800 dark:text-white">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-500"
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.price)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">السعر</p>
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                        {(item.price * item.quantity).toFixed(2)} <span className="text-[10px]">ج</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>

          {/* Footer: Grand Total */}
          <div className="p-6 space-y-6 bg-slate-900 dark:bg-black/40 relative overflow-hidden shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <div className="flex justify-between items-end relative z-10">
              <div className="space-y-1">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">الإجمالي النهائي</span>
                <p className="text-[10px] text-blue-400 font-bold italic">شامل ضريبة القيمة المضافة</p>
              </div>
              <div className="text-left">
                <span className="text-5xl font-black text-white tracking-tighter leading-none block">
                  {calculateTotal().toFixed(2)}
                </span>
                <span className="text-sm font-black text-blue-500 uppercase ml-1 tracking-widest mt-1 block">جنيه مصري</span>
              </div>
            </div>

            <div className="flex gap-3 relative z-10">
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 text-white shrink-0 active:scale-90 transition-all"
              >
                <Printer className="w-5 h-5" />
              </Button>
              <Button
                onClick={openEmployeeDialog}
                className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/20 font-black text-white tracking-wide active:scale-95 transition-all text-base"
              >
                إتمام العملية الآن
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={showSizeDialog} onOpenChange={setShowSizeDialog}>
        <DialogContent className="max-w-2xl text-center rounded-[3rem] p-0 overflow-hidden border-none bg-white dark:bg-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.3)]" dir="rtl">
          <div className="bg-slate-900 p-8 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/30 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-3xl font-black tracking-tight">تخصيص الحجم</DialogTitle>
              <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest">اختر المقاس المفضل للمنتج</p>
            </DialogHeader>
          </div>

          <div className="p-8">
            {selectedProduct && (
              <div className="space-y-8">
                <div className="flex flex-col items-center gap-6">
                  {selectedProduct.image ? (
                    <div className="w-64 h-48 rounded-[2rem] overflow-hidden shadow-2xl bg-slate-50 dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-800">
                      <img src={"https://greensolar-power.com/POS-API/" + selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-600/10 flex items-center justify-center">
                      <Package className="w-10 h-10 text-blue-600" />
                    </div>
                  )}
                  <h2 className="font-black text-2xl text-slate-800 dark:text-white tracking-tight">{selectedProduct.name}</h2>
                </div>

                <div className="grid grid-cols-3 gap-6 mt-10">
                  {selectedProduct.s_price > 0 && (
                    <Button
                      onClick={() => handleSelectSize("s")}
                      className="h-32 flex flex-col items-center justify-center gap-3 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-none hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-lg group active:scale-95"
                    >
                      <span className="text-xs font-black text-slate-400 group-hover:text-blue-100 uppercase tracking-widest">صغير (S)</span>
                      <span className="text-2xl font-black">{selectedProduct.s_price} ج</span>
                    </Button>
                  )}
                  {selectedProduct.m_price > 0 && (
                    <Button
                      onClick={() => handleSelectSize("m")}
                      className="h-32 flex flex-col items-center justify-center gap-3 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-none hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-lg group active:scale-95"
                    >
                      <span className="text-xs font-black text-slate-400 group-hover:text-purple-100 uppercase tracking-widest">وسط (M)</span>
                      <span className="text-2xl font-black">{selectedProduct.m_price} ج</span>
                    </Button>
                  )}
                  {selectedProduct.l_price > 0 && (
                    <Button
                      onClick={() => handleSelectSize("l")}
                      className="h-32 flex flex-col items-center justify-center gap-3 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-none hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-lg group active:scale-95"
                    >
                      <span className="text-xs font-black text-slate-400 group-hover:text-emerald-100 uppercase tracking-widest">كبير (L)</span>
                      <span className="text-2xl font-black">{selectedProduct.l_price} ج</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Premium Employee Dialog */}
      <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-2xl" dir="rtl">
          <div className="bg-slate-900 p-8 text-white relative">
            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-600/30 blur-[80px] rounded-full -translate-x-1/2 -translate-y-1/2" />
            <DialogHeader className="relative z-10 text-right">
              <DialogTitle className="text-3xl font-black tracking-tight">تأكيد العملية</DialogTitle>
              <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest">خطوات نهائية لإصدار الفاتورة</p>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-8">
            <div className="space-y-3">
              <Label className="text-sm font-black text-slate-500 uppercase tracking-widest mr-2">الموظف المسؤول</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-full h-16 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl p-5 text-lg font-black text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all">
                  <SelectValue placeholder="-- اختر الموظف --" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl">
                  {employees.map((emp) => (
                    <SelectItem 
                      key={emp.id} 
                      value={emp.id.toString()} 
                      className="font-bold py-3 focus:bg-blue-600 focus:text-white rounded-xl"
                    >
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-black text-slate-500 uppercase tracking-widest mr-2">ملاحظات التحضير</Label>
              <div className="relative group">
                <Receipt className="absolute right-5 top-5 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="text"
                  placeholder="مثال: بدون سكر - زيادة ثلج..."
                  value={kitchenNote}
                  onChange={(e) => setKitchenNote(e.target.value)}
                  className="h-16 pr-14 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-lg font-bold placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <Button 
                className="w-full h-16 text-lg font-black tracking-wide rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xl active:scale-[0.98] transition-all" 
                size="lg" 
                onClick={handleCheckout}
            >
              حفظ وطباعة الفاتورة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesInterface;
