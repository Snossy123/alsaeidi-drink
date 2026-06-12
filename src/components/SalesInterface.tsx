import { useState, useRef, useEffect } from "react";
import { useGridLayout } from "@/hooks/useGridLayout";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useShift } from "@/hooks/useShift";
import { enqueueSale } from "@/lib/offline/syncQueue";
import CategoriesSidebar from "./CategoriesSidebar";

import { useSalesData } from "@/hooks/useSalesData";
import { useCart } from "@/hooks/useCart";
import { printInvoice } from "@/lib/invoicePrinter";
import type { PaymentMethod } from "@/types/salesInvoice";

import { BarcodeScanner } from "./sales/BarcodeScanner";
import { ProductGrid } from "./sales/ProductGrid";
import { CartSection } from "./sales/CartSection";
import { SizeSelectionDialog } from "./sales/SizeSelectionDialog";
import { CheckoutDialog } from "./sales/CheckoutDialog";
import { PosNavSheet } from "./sales/PosNavSheet";
import { OpenShiftDialog } from "./shifts/OpenShiftDialog";
import { CloseShiftDialog } from "./shifts/CloseShiftDialog";
import { ShiftBanner } from "./shifts/ShiftBanner";

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
  const { user } = useAuth();
  const { shift, requiresShift, openShift, closeShift, loading: shiftLoading } = useShift();
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const { itemsPerPage } = useGridLayout(gridContainerRef);

  const { products, categories, employees } = useSalesData();
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, calculateTotal } = useCart();

  const [barcode, setBarcode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showSizeDialog, setShowSizeDialog] = useState(false);
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [showCloseShiftDialog, setShowCloseShiftDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [kitchenNote, setKitchenNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (user?.type === "employee") {
      setSelectedEmployee(String(user.id));
    }
  }, [user]);

  useEffect(() => {
    if (showEmployeeDialog) {
      setAmountPaid(calculateTotal().toFixed(2));
    }
  }, [showEmployeeDialog, cart, calculateTotal]);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.barcode === barcode);
    setBarcode("");

    if (!product) {
      toast({ title: "المنتج غير موجود", variant: "destructive" });
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

    if (requiresShift && !shift) {
      toast({ title: "يجب فتح وردية أولاً", variant: "destructive" });
      return;
    }

    const total = calculateTotal();
    const paid = paymentMethod === "cash" ? parseFloat(amountPaid) || total : total;

    if (paymentMethod === "cash" && paid < total) {
      toast({ title: "المبلغ المدفوع أقل من الإجمالي", variant: "destructive" });
      return;
    }

    const now = new Date();
    const clientId = crypto.randomUUID();
    const invoiceNumber = navigator.onLine
      ? `INV-${now.toISOString().slice(0, 10).replace(/-/g, "")}-${now.getTime().toString().slice(-4)}`
      : `OFFLINE-${now.getTime()}`;
    const employee = employees.find((e) => e.id === Number(selectedEmployee));

    const invoiceData = {
      invoiceNumber,
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 8),
      employeeName: employee?.name || user?.name || "غير محدد",
      total,
      items: cart.map((item) => ({
        ...item,
        product_id: item.id,
      })),
      kitchen_note: kitchenNote,
      employee_id: selectedEmployee,
      payment_method: paymentMethod,
      amount_paid: paid,
      change_given: Math.max(0, paid - total),
      payment_status: "paid",
    };

    const finishSuccess = () => {
      printInvoice(invoiceData, false);
      printInvoice(invoiceData, true);
      toast({ title: "تمت العملية بنجاح ✅", description: `رقم الفاتورة: ${invoiceNumber}` });
      clearCart();
      if (user?.type !== "employee") setSelectedEmployee("");
      setShowEmployeeDialog(false);
      setKitchenNote("");
      setPaymentMethod("cash");
    };

    try {
      if (!navigator.onLine) {
        await enqueueSale(invoiceData, clientId);
        finishSuccess();
        toast({ title: "حُفظت محلياً", description: "ستُزامَن عند عودة الإنترنت" });
        return;
      }

      const result = await apiClient<{ status: string; message?: string }>("/sales-invoices", {
        method: "POST",
        headers: { "X-Client-Id": clientId },
        body: JSON.stringify(invoiceData),
      });

      if (result.status === "success") {
        finishSuccess();
      } else {
        toast({ title: "فشل الحفظ", description: result.message, variant: "destructive" });
      }
    } catch (error: any) {
      if (!navigator.onLine || error?.status === undefined) {
        await enqueueSale(invoiceData, clientId);
        finishSuccess();
        toast({ title: "حُفظت محلياً", description: "ستُزامَن عند عودة الإنترنت" });
        return;
      }

      if (error?.data?.code === "SHIFT_REQUIRED") {
        toast({ title: "يجب فتح وردية", variant: "destructive" });
        return;
      }

      toast({ title: "خطأ في الاتصال", description: error.message, variant: "destructive" });
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedCategory || product.category_id === selectedCategory)
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const showOpenShift = requiresShift && !shiftLoading && !shift;

  return (
    <div className="flex flex-col lg:flex-row h-full w-full antialiased bg-slate-50/50 dark:bg-slate-950/50 p-1.5 lg:p-2 gap-2 overflow-hidden" dir="rtl">
      <OpenShiftDialog
        open={showOpenShift}
        onOpenShift={async (openingFloat, notes) => {
          await openShift(openingFloat, notes);
          toast({ title: "تم فتح الوردية" });
        }}
      />

      <CloseShiftDialog
        open={showCloseShiftDialog}
        onOpenChange={setShowCloseShiftDialog}
        shift={shift}
        onCloseShift={async (actualCash, notes) => {
          await closeShift(actualCash, notes);
          toast({ title: "تم إغلاق الوردية" });
        }}
      />

      <div className="w-full lg:w-44 xl:w-48 2xl:w-56 shrink-0 h-auto lg:h-full overflow-hidden">
        <CategoriesSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={(id) => {
            setSelectedCategory(id);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden">
        {shift && <ShiftBanner shift={shift} onCloseClick={() => setShowCloseShiftDialog(true)} />}

        <BarcodeScanner
          barcode={barcode}
          setBarcode={setBarcode}
          handleBarcodeSubmit={handleBarcodeSubmit}
          onOpenNav={() => setNavOpen(true)}
        />

        <div ref={gridContainerRef} className="flex-1 min-h-0 overflow-hidden">
          <ProductGrid
            searchTerm={searchTerm}
            handleSearchChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            paginatedProducts={paginatedProducts}
            handleProductClick={handleProductClick}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        </div>
      </div>

      <div className="w-full lg:w-64 xl:w-72 2xl:w-80 shrink-0 h-auto lg:h-full overflow-hidden">
        <CartSection
          cart={cart}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          calculateTotal={calculateTotal}
          openEmployeeDialog={() =>
            cart.length > 0 ? setShowEmployeeDialog(true) : toast({ title: "السلة فارغة", variant: "destructive" })
          }
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
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        amountPaid={amountPaid}
        setAmountPaid={setAmountPaid}
        total={calculateTotal()}
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
