import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/constants";
import CategoriesSidebar from "./CategoriesSidebar";

// Custom Hooks & Utilities
import { useSalesData } from "@/hooks/useSalesData";
import { useCart } from "@/hooks/useCart";
import { printInvoice } from "@/lib/invoicePrinter";

// Sub-components
import { BarcodeScanner } from "./sales/BarcodeScanner";
import { ProductGrid } from "./sales/ProductGrid";
import { CartSection } from "./sales/CartSection";
import { SizeSelectionDialog } from "./sales/SizeSelectionDialog";
import { CheckoutDialog } from "./sales/CheckoutDialog";

const SalesInterface = () => {
  const { toast } = useToast();
  
  // Data State Hook
  const { products, categories, employees, loading } = useSalesData();
  
  // Cart Logic Hook
  const { 
    cart, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    calculateTotal 
  } = useCart();

  // Local UI State
  const [barcode, setBarcode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showSizeDialog, setShowSizeDialog] = useState(false);
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [kitchenNote, setKitchenNote] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Constants
  const itemsPerPage = 10; // Adjusted to show exactly 2 rows on 5-column desktop

  /**
   * Handlers
   */
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

    if (product.hasSizes) {
      setSelectedProduct(product);
      setShowSizeDialog(true);
    } else {
      addToCart(product);
    }
  };

  const handleProductClick = (product: any) => {
    if (product.hasSizes) {
      setSelectedProduct(product);
      setShowSizeDialog(true);
    } else {
      addToCart(product);
    }
  };

  const handleSelectSize = (size: "s" | "m" | "l") => {
    if (!selectedProduct) return;
    const price = size === "s" ? selectedProduct.s_price : size === "m" ? selectedProduct.m_price : selectedProduct.l_price;
    addToCart(selectedProduct, size, price);
    setShowSizeDialog(false);
    setSelectedProduct(null);
  };

  const handleCheckout = async () => {
    if (!selectedEmployee) {
      toast({ title: "لم يتم اختيار الموظف", variant: "destructive" });
      return;
    }

    const now = new Date();
    const invoiceNumber = `INV-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${now.getTime().toString().slice(-4)}`;
    const employee = employees.find(e => e.id === Number(selectedEmployee));
    
    const invoiceData = {
      invoiceNumber,
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 8),
      employeeName: employee?.name || "غير محدد",
      total: calculateTotal(),
      items: cart,
      kitchen_note: kitchenNote,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/sales-invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...invoiceData, employee_id: selectedEmployee })
      });

      const result = await res.json();

      if (result.status === "success") {
        printInvoice(invoiceData, false);
        printInvoice(invoiceData, true);

        toast({ title: "تمت العملية بنجاح ✅", description: `رقم الفاتورة: ${invoiceNumber}` });
        clearCart();
        setSelectedEmployee("");
        setShowEmployeeDialog(false);
        setKitchenNote("");
      } else {
        toast({ title: "فشل الحفظ", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "خطأ في الاتصال", variant: "destructive" });
    }
  };

  // Filter Logic
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!selectedCategory || product.category_id === selectedCategory)
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-full w-full antialiased bg-slate-50/50 dark:bg-slate-950/50 p-2 lg:p-4 gap-4 overflow-hidden lg:overflow-hidden" dir="rtl">
      
      {/* 1. Right Column: Categories (Desktop Right, Mobile Top) */}
      <div className="w-full lg:w-64 shrink-0">
        <CategoriesSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={(id) => { setSelectedCategory(id); setCurrentPage(1); }}
        />
      </div>

      {/* 2. Center Column: Barcode & Products */}
      <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-hidden">
        <BarcodeScanner 
          barcode={barcode}
          setBarcode={setBarcode}
          handleBarcodeSubmit={handleBarcodeSubmit}
        />

        <div className="flex-1 min-h-[500px] lg:min-h-0">
          <ProductGrid 
            searchTerm={searchTerm}
            handleSearchChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            paginatedProducts={paginatedProducts}
            handleProductClick={handleProductClick}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        </div>
      </div>

      {/* 3. Left Column: Cart */}
      <div className="w-full lg:w-80 shrink-0 h-auto lg:h-full relative">
        <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-full translate-y-1/2 pointer-events-none" />
        <CartSection 
          cart={cart}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          calculateTotal={calculateTotal}
          openEmployeeDialog={() => cart.length > 0 ? setShowEmployeeDialog(true) : toast({ title: "السلة فارغة", variant: "destructive" })}
        />
      </div>

      {/* Dialogs */}
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

