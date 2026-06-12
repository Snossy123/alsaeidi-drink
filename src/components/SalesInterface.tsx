import { useState, useRef, useEffect } from "react";
import { useGridLayout } from "@/hooks/useGridLayout";
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
import { PosNavSheet } from "./sales/PosNavSheet";

interface SalesInterfaceProps {
  activeTab?: string;
  onNavigate?: (tab: string) => void;
  dark?: boolean;
  onToggleDark?: () => void;
}

const SalesInterface = ({
  activeTab = "sales",
  onNavigate,
  dark = false,
  onToggleDark,
}: SalesInterfaceProps) => {
  const { toast } = useToast();
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const { itemsPerPage } = useGridLayout(gridContainerRef);

  // Data State Hook
  const { products, categories, employees } = useSalesData();

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
  const [navOpen, setNavOpen] = useState(false);

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

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full antialiased bg-slate-50/50 dark:bg-slate-950/50 p-1.5 lg:p-2 gap-2 overflow-hidden" dir="rtl">

      {/* 1. Right Column: Categories */}
      <div className="w-full lg:w-44 xl:w-48 2xl:w-56 shrink-0 h-auto lg:h-full overflow-hidden">
        <CategoriesSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={(id) => { setSelectedCategory(id); setCurrentPage(1); }}
        />
      </div>

      {/* 2. Center Column: Barcode & Products */}
      <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden">
        <BarcodeScanner
          barcode={barcode}
          setBarcode={setBarcode}
          handleBarcodeSubmit={handleBarcodeSubmit}
          onOpenNav={() => setNavOpen(true)}
        />

        <div ref={gridContainerRef} className="flex-1 min-h-0 overflow-hidden">
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
      <div className="w-full lg:w-60 xl:w-64 2xl:w-72 shrink-0 h-auto lg:h-full overflow-hidden">
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

      {onNavigate && onToggleDark && (
        <PosNavSheet
          open={navOpen}
          onOpenChange={setNavOpen}
          activeTab={activeTab}
          onNavigate={onNavigate}
          dark={dark}
          onToggleDark={onToggleDark}
        />
      )}
    </div>
  );
};

export default SalesInterface;
