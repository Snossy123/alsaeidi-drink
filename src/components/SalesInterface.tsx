import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { useGridLayout } from "@/hooks/useGridLayout";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useInvoiceEdit } from "@/contexts/InvoiceEditContext";
import { useShift } from "@/hooks/useShift";
import { enqueueSale } from "@/lib/offline/syncQueue";
import CategoriesSidebar from "./CategoriesSidebar";

import { useSalesData } from "@/hooks/useSalesData";
import { useCart, mergeCartItems } from "@/hooks/useCart";
import { printInvoiceCopies } from "@/lib/invoicePrinter";
import { localDateString, nextLocalDailyInvoiceNumber } from "@/lib/dailyInvoiceNumber";
import { getProductSizeOptions, getProductSizePrice, ProductSize } from "@/lib/productSizes";
import { Button } from "@/components/ui/button";
import type { OrderType, PaymentMethod, PaymentStatus, SaleInvoice } from "@/types/salesInvoice";

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
  const { editingInvoice, clearEditing } = useInvoiceEdit();
  const {
    shift,
    requiresShift,
    openShift,
    closeShift,
    loading: shiftLoading,
    isCachedShift,
    isOffline,
  } = useShift();
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const { itemsPerPage } = useGridLayout(gridContainerRef);

  const { products, categories, employees } = useSalesData();
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, loadCart, calculateTotal } = useCart();

  const [barcode, setBarcode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showSizeDialog, setShowSizeDialog] = useState(false);
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [showCloseShiftDialog, setShowCloseShiftDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [kitchenNote, setKitchenNote] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("takeaway");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("paid");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [currentPage, setCurrentPage] = useState(1);
  const [navOpen, setNavOpen] = useState(false);
  const loadedEditIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (user?.type === "employee") {
      setSelectedEmployee(String(user.id));
    }
  }, [user]);

  useEffect(() => {
    if (!editingInvoice) {
      loadedEditIdRef.current = null;
      return;
    }
    if (loadedEditIdRef.current === editingInvoice.id) return;
    loadedEditIdRef.current = editingInvoice.id;

    loadCart(
      editingInvoice.items.map((item) => ({
        id: item.product_id ?? item.id ?? item.name,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        barcode: item.barcode,
      }))
    );
    setOrderType(editingInvoice.order_type || "takeaway");
    setKitchenNote(editingInvoice.kitchen_note || "");
    setPaymentStatus("unpaid");
  }, [editingInvoice, loadCart]);

  const handleCancelEdit = () => {
    loadedEditIdRef.current = null;
    clearEditing();
    clearCart();
    setKitchenNote("");
    setOrderType("takeaway");
    setPaymentStatus("paid");
    setPaymentMethod("cash");
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.barcode === barcode);
    setBarcode("");

    if (!product) {
      toast({ title: "المنتج غير موجود", variant: "destructive" });
      return;
    }

    addProductToCart(product);
  };

  const addProductToCart = (product: Parameters<typeof addToCart>[0]) => {
    const sizeOptions = getProductSizeOptions(product);

    if (sizeOptions.length === 1) {
      addToCart(product, sizeOptions[0].key, sizeOptions[0].price);
      return;
    }

    if (sizeOptions.length > 1) {
      setSelectedProduct(product);
      setShowSizeDialog(true);
      return;
    }

    if (product.hasSizes) {
      const fallbackPrice = Number(product.price ?? 0);
      if (fallbackPrice > 0) {
        addToCart(product, null, fallbackPrice);
        return;
      }

      setSelectedProduct(product);
      setShowSizeDialog(true);
      return;
    }

    addToCart(product);
  };

  const handleProductClick = (product: Parameters<typeof addToCart>[0]) => {
    addProductToCart(product);
  };

  const handleSelectSize = (size: ProductSize) => {
    if (!selectedProduct) return;
    const price = getProductSizePrice(selectedProduct, size);
    if (!price) return;

    addToCart(selectedProduct, size, price);
    setShowSizeDialog(false);
    setSelectedProduct(null);
  };

  const handleCheckout = async (cashAmountPaid = "") => {
    if (requiresShift && !shift && !editingInvoice) {
      toast({ title: "يجب فتح وردية أولاً", variant: "destructive" });
      return;
    }

    const mergedCart = mergeCartItems(cart);
    const total = mergedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (editingInvoice) {
      if (!navigator.onLine) {
        toast({ title: "التعديل يتطلب اتصال بالإنترنت", variant: "destructive" });
        return;
      }

      const updatePayload = {
        items: mergedCart.map((item) => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          barcode: item.barcode || "",
        })),
        kitchen_note: kitchenNote,
        total,
      };

      try {
        const result = await apiClient<{ status: string; invoice: SaleInvoice; message?: string }>(
          `/sales-invoices/${editingInvoice.id}/items`,
          {
            method: "PATCH",
            body: JSON.stringify(updatePayload),
          }
        );

        if (result.status === "success") {
          const updated = result.invoice;
          void printInvoiceCopies({
            invoiceNumber: updated.invoiceNumber,
            date: updated.date,
            time: updated.time,
            employeeName: updated.cashier || "",
            total: updated.total,
            items: updated.items,
            kitchen_note: updated.kitchen_note,
            order_type: updated.order_type,
            payment_status: updated.payment_status,
            payment_method: updated.payment_method,
            amount_paid: updated.amount_paid,
            change_given: updated.change_given,
            shift_id: shift?.id,
          });
          toast({ title: "تم تحديث الفاتورة", description: updated.invoiceNumber });
          handleCancelEdit();
          setShowEmployeeDialog(false);
        } else {
          toast({ title: "فشل التحديث", description: result.message, variant: "destructive" });
        }
      } catch (error: any) {
        toast({ title: "فشل التحديث", description: error.message, variant: "destructive" });
      }
      return;
    }

    const cartItems = mergedCart;
    const checkoutTotal = total;

    const isPaid = paymentStatus === "paid";
    const paid = isPaid
      ? (paymentMethod === "cash" ? parseFloat(cashAmountPaid) || checkoutTotal : checkoutTotal)
      : 0;

    if (isPaid && paymentMethod === "cash" && paid < checkoutTotal) {
      toast({ title: "المبلغ المدفوع أقل من الإجمالي", variant: "destructive" });
      return;
    }

    const now = new Date();
    const clientId = crypto.randomUUID();
    const employee = employees.find((e) => e.id === Number(selectedEmployee));

    const invoiceData = {
      invoiceNumber: "",
      date: localDateString(now),
      time: now.toTimeString().slice(0, 8),
      employeeName: employee?.name || user?.name || "غير محدد",
      total: checkoutTotal,
      items: cartItems.map((item) => ({
        ...item,
        product_id: item.id,
      })),
      kitchen_note: kitchenNote,
      employee_id: selectedEmployee || null,
      shift_id: shift?.id,
      payment_method: paymentMethod,
      amount_paid: paid,
      change_given: isPaid ? Math.max(0, paid - checkoutTotal) : 0,
      payment_status: paymentStatus,
      order_type: orderType,
    };

    const finishSuccess = (invoiceNumber: string) => {
      const printable = { ...invoiceData, invoiceNumber };
      void printInvoiceCopies(printable);
      toast({ title: "تمت العملية بنجاح ✅", description: `رقم الفاتورة: ${invoiceNumber}` });
      clearCart();
      if (user?.type !== "employee") setSelectedEmployee("");
      setShowEmployeeDialog(false);
      setKitchenNote("");
      setOrderType("takeaway");
      setPaymentStatus("paid");
      setPaymentMethod("cash");
    };

    const saveOffline = async () => {
      const invoiceNumber = nextLocalDailyInvoiceNumber(now);
      const offlinePayload = { ...invoiceData, invoiceNumber };
      await enqueueSale(offlinePayload, clientId);
      finishSuccess(invoiceNumber);
      toast({ title: "حُفظت محلياً", description: "ستُزامَن عند عودة الإنترنت" });
    };

    try {
      if (!navigator.onLine) {
        await saveOffline();
        return;
      }

      const result = await apiClient<{ status: string; invoice?: SaleInvoice; message?: string }>(
        "/sales-invoices",
        {
          method: "POST",
          headers: { "X-Client-Id": clientId },
          body: JSON.stringify(invoiceData),
        }
      );

      if (result.status === "success") {
        const invoiceNumber = result.invoice?.invoiceNumber;
        if (!invoiceNumber) {
          toast({ title: "فشل الحفظ", description: "لم يُرجع السيرفر رقم الفاتورة", variant: "destructive" });
          return;
        }
        finishSuccess(invoiceNumber);
      } else {
        toast({ title: "فشل الحفظ", description: result.message, variant: "destructive" });
      }
    } catch (error: any) {
      if (!navigator.onLine || error?.status === undefined) {
        await saveOffline();
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
        offline={isOffline}
        onOpenShift={async (openingFloat, notes) => {
          try {
            await openShift(openingFloat, notes);
            toast({ title: "تم فتح الوردية" });
          } catch (error: any) {
            toast({ title: error.message || "فشل فتح الوردية", variant: "destructive" });
          }
        }}
      />

      <CloseShiftDialog
        open={showCloseShiftDialog}
        onOpenChange={setShowCloseShiftDialog}
        shift={shift}
        onCloseShift={async (actualCash, notes) => {
          try {
            await closeShift(actualCash, notes);
            toast({ title: "تم إغلاق الوردية" });
          } catch (error: any) {
            toast({ title: error.message || "فشل إغلاق الوردية", variant: "destructive" });
          }
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
        {editingInvoice && (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-2 shrink-0">
            <p className="text-sm font-black text-amber-700 dark:text-amber-400">
              تعديل فاتورة {editingInvoice.invoiceNumber}
            </p>
            <Button variant="ghost" size="sm" className="gap-1 h-8" onClick={handleCancelEdit}>
              <X className="w-4 h-4" /> إلغاء
            </Button>
          </div>
        )}

        {shift && (
          <ShiftBanner
            shift={shift}
            onCloseClick={() => setShowCloseShiftDialog(true)}
            isCached={isCachedShift}
            isOffline={isOffline}
          />
        )}

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
          editMode={!!editingInvoice}
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
        orderType={orderType}
        setOrderType={setOrderType}
        paymentStatus={paymentStatus}
        setPaymentStatus={setPaymentStatus}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        total={calculateTotal()}
        handleCheckout={handleCheckout}
        editMode={!!editingInvoice}
        editInvoiceNumber={editingInvoice?.invoiceNumber}
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
