
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Barcode, Plus, Minus, Trash2, Printer, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";


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

  // Mock products data
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === 'success' && Array.isArray(result.products)) {
          setProducts(result.products);
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (error: any) {
        toast({
          title: "فشل تحميل المنتجات",
          description: error.message || "تحقق من اتصال الإنترنت أو السيرفر",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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
    if (product) {
      addToCart(product);
      setBarcode("");
    } else {
      toast({
        title: "المنتج غير موجود",
        description: "لم يتم العثور على منتج بهذا الباركود",
        variant: "destructive"
      });
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "السلة فارغة",
        description: "يرجى إضافة منتجات إلى السلة أولاً",
        variant: "destructive"
      });
      return;
    }

    const now = new Date();
    const invoiceNumber = `INV-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${now.getTime().toString().slice(-4)}`;
    const invoiceData = {
      invoiceNumber,
      date: now.toISOString().slice(0, 10),
      // time: now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      time: now.toTimeString().slice(0, 8),
      cashier: "البائع الرئيسي",
      total: calculateTotal(),
      items: cart
    };

    try {
      const res = await fetch(API_URL + '/sales-invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });

      const result = await res.json();

      if (result.status === 'success') {
        toast({
          title: "تمت عملية البيع بنجاح",
          description: `رقم الفاتورة: ${invoiceNumber} - المبلغ: ${calculateTotal().toFixed(2)} جنية`,
        });
        setCart([]);
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
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showSizeDialog, setShowSizeDialog] = useState(false);

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

    addToCart({ ...selectedProduct, price}, size);
    setShowSizeDialog(false);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Main Sales Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Barcode Scanner */}
          <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Barcode className="w-5 h-5" />
                قارئ الباركود
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                <Input
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="امسح الباركود أو اكتبه..."
                  className="flex-1 text-center font-mono text-lg"
                  autoFocus
                />
                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  إضافة
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Search className="w-5 h-5" />
                المنتجات المتاحة
              </CardTitle>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن المنتجات..."
                className="mt-2"
              />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-blue-100 hover:border-blue-300"
                    onClick={() => handleProductClick(product)}
                  >
                    <CardContent className="p-4 text-center">
                      <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                      {product.hasSizes ? (
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>صغير: <span className="text-blue-600 font-semibold">{product.s_price} ج</span></p>
                          <p>وسط: <span className="text-blue-600 font-semibold">{product.m_price} ج</span></p>
                          <p>كبير: <span className="text-blue-600 font-semibold">{product.l_price} ج</span></p>
                        </div>
                      ) : (
                        <p className="text-lg font-bold text-blue-600 mb-2">{product.price} ج</p>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        متوفر: {product.stock}
                      </Badge>
                    </CardContent>
                  </Card>

                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100 sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Receipt className="w-5 h-5" />
                سلة المشتريات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-8">السلة فارغة</p>
              ) : (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={`${item.id}-${item.price}`} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">
                            {item.name}{" "}
                            {item.size
                              ? `(${item.size === 's' ? 'صغير' : item.size === 'm' ? 'وسط' : 'كبير'})`
                              : ""}
                          </h4>
                          <p className="text-sm text-blue-600">{item.price} جنية</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.price)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.price)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(item.id, item.price)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>الإجمالي:</span>
                      <span className="text-blue-600">{calculateTotal().toFixed(2)} جنية</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="border-blue-200 hover:bg-blue-50"
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        طباعة
                      </Button>
                      <Button
                        onClick={handleCheckout}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        إتمام البيع
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSizeDialog} onOpenChange={setShowSizeDialog}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>اختر الحجم والسعر</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-3">
              <p className="font-semibold text-gray-700">{selectedProduct.name}</p>

              <div className="grid grid-cols-3 gap-3 mt-4">
                {selectedProduct.s_price > 0 && (
                  <Button onClick={() => handleSelectSize("s")} className="bg-blue-500 hover:bg-blue-600">
                    صغير <br /> {selectedProduct.s_price} ج
                  </Button>
                )}
                {selectedProduct.m_price > 0 && (
                  <Button onClick={() => handleSelectSize("m")} className="bg-blue-500 hover:bg-blue-600">
                    وسط <br /> {selectedProduct.m_price} ج
                  </Button>
                )}
                {selectedProduct.l_price > 0 && (
                  <Button onClick={() => handleSelectSize("l")} className="bg-blue-500 hover:bg-blue-600">
                    كبير <br /> {selectedProduct.l_price} ج
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesInterface;
