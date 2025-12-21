import { useState, useEffect, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Search, Edit, Trash2, Barcode, ChevronRight, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CategoryManagement from "./CategoryManagement";
import { API_BASE_URL } from "@/lib/constants";
import { Switch } from "@/components/ui/switch";

const ITEMS_PER_PAGE = 8; // عدد المنتجات في كل صفحة

const ProductManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    stock: "",
    barcode: "",
    category: "",
    hasSizes: false,
    prices: { small: "", medium: "", large: "", default: "" }
  });

  const { toast } = useToast();
  const API_PRODUCTS_URL = API_BASE_URL + "/products";
  const API_CATEGORIES_URL = API_BASE_URL + "/categories";

  // ✅ جلب البيانات
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProducts, resCategories] = await Promise.all([
          fetch(API_PRODUCTS_URL),
          fetch(API_CATEGORIES_URL)
        ]);
        const productsData = await resProducts.json();
        const categoriesData = await resCategories.json();
        setProducts(productsData.products || []);
        setCategories(categoriesData.categories || []);
      } catch (error) {
        toast({ title: "خطأ في الاتصال", variant: "destructive" });
      }
    };
    fetchData();
  }, []);

  // 🔍 تصفية المنتجات بناءً على البحث
  const filteredProducts = products.filter((product) => {
    const categoryName = categories.find((c) => Number(c.id) === product.category_id)?.name || "";
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // 📑 حسابات Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // إعادة التعيين لصفحة 1 عند البحث
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const generateBarcode = () => {
    const barcode = Math.floor(Math.random() * 1000000000).toString();
    setFormData({ ...formData, barcode });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newProduct = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      name: formData.name,
      stock: parseFloat(formData.stock) || 0,
      barcode: formData.barcode,
      category: formData.category ? Number(formData.category) : null,
      hasSizes: formData.hasSizes,
      price: formData.hasSizes ? 0 : parseFloat(formData.prices.default) || 0,
      s_price: formData.hasSizes ? parseFloat(formData.prices.small) || 0 : 0,
      m_price: formData.hasSizes ? parseFloat(formData.prices.medium) || 0 : 0,
      l_price: formData.hasSizes ? parseFloat(formData.prices.large) || 0 : 0,
    };

    try {
      const response = await fetch(API_PRODUCTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: editingProduct ? "update" : "add", product: newProduct })
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
        setIsDialogOpen(false);
        toast({ title: "تم الحفظ بنجاح" });
      }
    } catch (error) {
      toast({ title: "خطأ في الاتصال", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      const response = await fetch(API_PRODUCTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id })
      });
      const data = await response.json();
      if (data.success) setProducts(data.products);
    } catch (error) {
      toast({ title: "خطأ في الحذف", variant: "destructive" });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      stock: product.stock.toString(),
      barcode: product.barcode || "",
      category: product.category_id ? String(product.category_id) : "",
      hasSizes: product.hasSizes || false,
      prices: product.hasSizes
        ? { small: product.s_price?.toString() || "", medium: product.m_price?.toString() || "", large: product.l_price?.toString() || "", default: "" }
        : { small: "", medium: "", large: "", default: product.price.toString() },
    });
    setIsDialogOpen(true);
  };

  const getCategoryColor = (categoryId: any) => {
    const category = categories.find(c => Number(c.id) === Number(categoryId));
    return category?.color || "#6B7280";
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-black text-blue-800 dark:text-blue-400">إدارة المنتجات</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-xl text-lg font-bold"
              onClick={() => {
                setEditingProduct(null);
                setFormData({ name: "", hasSizes: false, prices: { small: "", medium: "", large: "", default: "" }, stock: "", barcode: "", category: "" });
              }}
            >
              <Plus className="w-5 h-5 ml-2" /> إضافة منتج
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg dark:bg-slate-900 dark:border-slate-800" dir="rtl">
            <DialogHeader><DialogTitle className="text-2xl dark:text-white">{editingProduct ? "تعديل" : "إضافة"} منتج</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              {/* الحقول بنفس التنسيق الداكن */}
              <div className="space-y-2">
                <Label className="dark:text-slate-300">اسم المنتج *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="dark:bg-slate-800 dark:border-slate-700 h-11 dark:text-white" />
              </div>
              <div className="flex items-center gap-3 py-2">
                <Switch checked={formData.hasSizes} onCheckedChange={(c) => setFormData({ ...formData, hasSizes: c })} />
                <Label className="dark:text-slate-300">يوجد أحجام مختلفة</Label>
              </div>
              {/* تفاصيل الأسعار والباركود والكمية - مختصره للوضع الداكن */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="dark:text-slate-300">الكمية</Label>
                  <Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="dark:bg-slate-800 dark:border-slate-700 h-11 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-slate-300">الفئة</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 h-11 dark:text-white"><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                      {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3 pt-6">
                <Button type="submit" className="flex-1 bg-blue-600 h-12 text-lg">حفظ المنتج</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-12 dark:border-slate-700">إلغاء</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Management */}
      <CategoryManagement categories={categories} onCategoriesUpdate={setCategories} />

      {/* Search Bar */}
      <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-blue-100 dark:border-slate-800 shadow-sm">
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 pr-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              placeholder="ابحث باسم المنتج أو الفئة..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {paginatedProducts.map((product) => (
          <Card key={product.id} className="bg-white dark:bg-slate-800/50 border-blue-50 dark:border-slate-800 hover:shadow-xl transition-all">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="space-y-1 overflow-hidden">
                <CardTitle className="text-base font-bold dark:text-slate-100 truncate">{product.name}</CardTitle>
                <Badge variant="outline" className="text-[10px] font-bold" style={{ color: getCategoryColor(product.category_id), borderColor: getCategoryColor(product.category_id) }}>
                  {categories.find(c => Number(c.id) === product.category_id)?.name || "بدون فئة"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-3">
              {product.hasSizes ? (
                <div className="grid grid-cols-3 gap-1">
                  {[{ l: "ص", v: product.s_price, c: "blue" }, { l: "و", v: product.m_price, c: "purple" }, { l: "ك", v: product.l_price, c: "green" }].map((s, i) => (
                    <div key={i} className="text-center bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-lg border dark:border-slate-800">
                      <p className="text-[9px] text-slate-400">{s.l}</p>
                      <p className="text-[11px] font-black text-blue-600 dark:text-blue-400">{Number(s.v).toFixed(1)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-center border border-blue-100 dark:border-blue-900/30">
                  <span className="text-lg font-black text-blue-700 dark:text-blue-400">{Number(product.price).toFixed(2)} ج</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs px-1">
                <span className="text-slate-500">المخزون:</span>
                <span className={`font-bold ${product.stock < 5 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>{product.stock}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(product)} className="flex-1 h-9 bg-slate-50 dark:bg-slate-900 dark:text-slate-300 hover:text-blue-600">
                  <Edit className="w-4 h-4 ml-1" /> تعديل
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)} className="h-9 w-10 text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-6">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="dark:border-slate-700 dark:text-slate-300"
          >
            <ChevronRight className="w-5 h-5 ml-1" /> السابق
          </Button>
          <span className="text-sm font-bold dark:text-slate-400">
            صفحة {currentPage} من {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="dark:border-slate-700 dark:text-slate-300"
          >
            التالي <ChevronLeft className="w-5 h-5 mr-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;