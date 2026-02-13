import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/constants";
import CategoriesSidebar from "./CategoriesSidebar";

// Sub-components
import { BarcodeScanner } from "./sales/BarcodeScanner";
import { ProductGrid } from "./sales/ProductGrid";
import { CartSection } from "./sales/CartSection";
import { SizeSelectionDialog } from "./sales/SizeSelectionDialog";
import { CheckoutDialog } from "./sales/CheckoutDialog";

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
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="flex flex-col lg:flex-row-reverse gap-2 lg:gap-6 h-full lg:h-[calc(100vh-40px)] w-full antialiased overflow-y-auto lg:overflow-hidden bg-slate-50 dark:bg-slate-950 p-2 lg:p-4" dir="rtl">

      {/* 1. Right Column: Categories (Refined) */}
      <div className="shrink-0 w-full lg:w-auto">
        <CategoriesSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>

      {/* 2. Center Column: Barcode & Products */}
      <div className="flex-1 flex flex-col gap-2 lg:gap-6 overflow-hidden min-h-[500px]">
        
        <BarcodeScanner 
          barcode={barcode}
          setBarcode={setBarcode}
          handleBarcodeSubmit={handleBarcodeSubmit}
        />

        <ProductGrid 
          searchTerm={searchTerm}
          handleSearchChange={handleSearchChange}
          paginatedProducts={paginatedProducts}
          handleProductClick={handleProductClick}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      </div>

      {/* 3. Left Column: Cart (Premium Overhaul) */}
      <div className="w-full lg:w-80 shrink-0 h-[400px] lg:h-full relative mt-4 lg:mt-0">
        <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-full translate-y-1/2" />
        
        <CartSection 
          cart={cart}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          calculateTotal={calculateTotal}
          openEmployeeDialog={openEmployeeDialog}
        />
      </div>

      <SizeSelectionDialog 
        showSizeDialog={showSizeDialog}
        setShowSizeDialog={setShowSizeDialog}
        selectedProduct={selectedProduct}
        handleSelectSize={handleSelectSize}
      />

      <CheckoutDialog 
        showEmployeeDialog={showEmployeeDialog}
        setShowEmployeeDialog={setShowEmployeeDialog}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        employees={employees}
        kitchenNote={kitchenNote}
        setKitchenNote={setKitchenNote}
        handleCheckout={handleCheckout}
      />

    </div>
  );
};

export default SalesInterface;
