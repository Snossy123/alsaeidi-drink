import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Barcode, Plus, Minus, Trash2, Printer, Receipt, ChevronLeft, ChevronRight } from "lucide-react";
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
    <div className="flex flex-row-reverse gap-4 h-[calc(100vh-100px)] p-2 antialiased overflow-hidden">

      {/* 1. Right Column: Categories (Narrow) */}
      <div className="shrink-0">
        <CategoriesSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>

      {/* 2. Center Column: Barcode & Products (Wide) */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">

        {/* Compact Barcode Scanner (Dark Mode Fixed) */}
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-blue-100 dark:border-slate-800 shrink-0 shadow-sm">
          <CardContent className="p-3">
            <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-3">
              {/* Icon and Label */}
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400 shrink-0">
                <Barcode className="w-5 h-5" />
                <span className="text-sm font-bold hidden sm:inline">الباركود:</span>
              </div>

              {/* Input Field */}
              <Input
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="امسح الباركود..."
                className="flex-1 font-mono text-base h-10 bg-white/50 dark:bg-slate-800 border-blue-200 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 focus:ring-blue-500"
                autoFocus
              />

              {/* Action Button */}
              <Button
                type="submit"
                size="sm"
                className="h-10 px-6 bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white shadow-md active:scale-95 transition-all"
              >
                إضافة
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Product Grid Card */}
        <Card className="flex-1 flex flex-col bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-blue-100 dark:border-slate-800 overflow-hidden">
          <CardHeader className="py-3 px-4 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-400 text-lg">
                <Search className="w-5 h-5" />
                المنتجات
              </CardTitle>
              <Input
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="ابحث هنا..."
                className="max-w-[250px] h-9 bg-white/50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 pt-0">
            <div className="grid grid-cols-3 gap-3">
              {paginatedProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer rounded-xl touch-manipulation active:scale-95 transition-all border-blue-50 dark:border-slate-800 dark:bg-slate-800/50 hover:border-blue-200 dark:hover:border-blue-500 shadow-sm"
                  onClick={() => handleProductClick(product)}
                >
                  <CardContent className="p-3 text-center flex flex-col h-full justify-between gap-2">
                    <h3 className="font-bold text-gray-800 dark:text-slate-100 text-sm line-clamp-2 leading-tight">
                      {product.name}
                    </h3>

                    {product.hasSizes ? (
                      <div className="grid grid-cols-3 gap-1">
                        {/* الصغير */}
                        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-md py-1 border dark:border-blue-900/50">
                          <p className="text-[9px] text-gray-500 dark:text-slate-400">ص</p>
                          <p className="text-blue-700 dark:text-blue-400 font-bold text-[10px]">{product.s_price}ج</p>
                        </div>
                        {/* الوسط */}
                        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-md py-1 border dark:border-purple-900/50">
                          <p className="text-[9px] text-gray-500 dark:text-slate-400">و</p>
                          <p className="text-purple-700 dark:text-purple-400 font-bold text-[10px]">{product.m_price}ج</p>
                        </div>
                        {/* الكبير */}
                        <div className="bg-green-50 dark:bg-green-900/30 rounded-md py-1 border dark:border-green-900/50">
                          <p className="text-[9px] text-gray-500 dark:text-slate-400">ك</p>
                          <p className="text-green-700 dark:text-green-400 font-bold text-[10px]">{product.l_price}ج</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md py-2 border dark:border-blue-900/30">
                        <p className="text-blue-700 dark:text-blue-400 font-bold text-base">{product.price} ج</p>
                      </div>
                    )}

                    <Badge
                      variant={product.stock > 0 ? "secondary" : "destructive"}
                      className="text-[9px] py-0 mx-auto dark:bg-slate-700 dark:text-slate-200"
                    >
                      {product.stock > 0 ? `مخزون: ${product.stock}` : "منتهي"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>

          {/* Pagination Footer */}
          <CardFooter className="py-3 border-t border-blue-50 dark:border-slate-800 flex justify-between shrink-0 px-4">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full dark:border-slate-700 dark:text-slate-300"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <span className="text-xs font-bold text-blue-800 dark:text-blue-400">
              {currentPage} من {totalPages || 1}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full dark:border-slate-700 dark:text-slate-300"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* 3. Left Column: Cart (Dark Mode Fixed) */}
      <div className="w-72 shrink-0 h-full">
        <Card className="h-full flex flex-col bg-white dark:bg-slate-900 border-blue-100 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden">

          {/* Header */}
          <CardHeader className="py-3 px-4 bg-blue-50/30 dark:bg-blue-900/20 border-b dark:border-slate-800 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-400 font-bold">
                <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm">الفاتورة</span>
              </div>
              <Badge className="bg-blue-600 dark:bg-blue-500 text-white text-[10px] px-1.5 h-5 border-none">
                {cart.length} أصناف
              </Badge>
            </div>
          </CardHeader>

          {/* Cart Items Container */}
          <CardContent className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/20 dark:bg-slate-950/20">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-2 opacity-40">
                <Receipt className="w-8 h-8" />
                <p className="text-xs">السلة فارغة</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.id}-${item.price}`}
                  className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-2 shadow-sm"
                >
                  {/* Row 1: Name & Trash */}
                  <div className="flex justify-between items-start gap-1">
                    <div className="min-w-0">
                      <h4 className="font-bold text-[13px] text-slate-800 dark:text-slate-100 truncate">
                        {item.name}
                      </h4>
                      {item.size && (
                        <span className="text-[10px] text-blue-500 dark:text-blue-400 font-bold">
                          ({item.size === 's' ? 'صغير' : item.size === 'm' ? 'وسط' : 'كبير'})
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 shrink-0"
                      onClick={() => removeFromCart(item.id, item.price)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Row 2: Price & Quantity Controls */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                    <span className="text-sm font-black text-blue-700 dark:text-blue-400">
                      {(item.price * item.quantity).toFixed(2)} <span className="text-[9px]">ج</span>
                    </span>

                    <div className="flex items-center bg-slate-50 dark:bg-slate-900 rounded-lg p-0.5 border dark:border-slate-700">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.price)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-xs font-bold w-6 text-center text-slate-700 dark:text-slate-200">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.price)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>

          {/* Footer */}
          <CardFooter className="flex flex-col p-4 bg-white dark:bg-slate-900 border-t border-blue-50 dark:border-slate-800 shrink-0">
            <div className="flex justify-between items-center w-full mb-4">
              <span className="text-slate-900 dark:text-slate-100 font-bold">الإجمالي:</span>
              <div className="text-right">
                <span className="text-2xl font-black text-blue-700 dark:text-blue-400 leading-none">
                  {calculateTotal().toFixed(2)}
                </span>
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 mr-1">جنية</span>
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-12 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0"
              >
                <Printer className="w-4 h-4" />
              </Button>
              <Button
                onClick={openEmployeeDialog}
                className="flex-1 h-11 rounded-xl bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 shadow-md font-bold text-white transition-all active:scale-95 text-sm"
              >
                إتمام الطلب
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      <Dialog open={showSizeDialog} onOpenChange={setShowSizeDialog}>
        <DialogContent className="max-w-xl text-center rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">اختر الحجم والسعر</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <p className="font-semibold text-gray-700 text-xl">{selectedProduct.name}</p>

              <div className="grid grid-cols-3 gap-4 mt-6">
                {selectedProduct.s_price > 0 && (
                  <Button
                    onClick={() => handleSelectSize("s")}
                    size="lg"
                    className="h-28 text-xl rounded-2xl touch-manipulation active:scale-95"
                  >
                    <span>صغير</span>
                    <span className="text-base font-bold">{selectedProduct.s_price} ج</span>
                  </Button>
                )}
                {selectedProduct.m_price > 0 && (
                  <Button
                    onClick={() => handleSelectSize("m")}
                    size="lg"
                    className="h-28 text-xl rounded-2xl touch-manipulation active:scale-95"
                  >
                    <span>وسط</span>
                    <span className="text-base font-bold">{selectedProduct.m_price} ج</span>
                  </Button>
                )}
                {selectedProduct.l_price > 0 && (
                  <Button
                    onClick={() => handleSelectSize("l")}
                    size="lg"
                    className="h-28 text-xl rounded-2xl touch-manipulation active:scale-95"
                  >
                    <span>كبير</span>
                    <span className="text-base font-bold">{selectedProduct.l_price} ج</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* ✅ نافذة اختيار الموظف */}
      <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">اختيار الموظف وإضافة ملاحظة</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <Label className="text-lg mb-2 block">اختر الموظف</Label>
              <select
                className="w-full border rounded-md p-4 mt-2 text-lg h-14"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">-- اختر الموظف --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-lg mb-2 block">ملاحظة خاصة (تظهر في نسخة المطبخ فقط)</Label>
              <Input
                type="text"
                placeholder="مثال: بدون بصل - زيادة جبنة - حار جداً"
                value={kitchenNote}
                onChange={(e) => setKitchenNote(e.target.value)}
                className="h-14 text-lg"
              />
            </div>

            <Button className="w-full h-14 text-lg touch-manipulation" size="lg" onClick={handleCheckout}>
              إتمام العملية
            </Button>
          </div>
        </DialogContent>

      </Dialog>
    </div>
  );
};

export default SalesInterface;
