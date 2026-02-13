import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/constants";
import { Category, Product } from "@/types";

import CategoryManagement from "./CategoryManagement";
import ProductDialog from "./product-management/ProductDialog";
import ProductFilters from "./product-management/ProductFilters";
import ProductCard from "./product-management/ProductCard";
import ProductPagination from "./product-management/ProductPagination";
import { Package } from "lucide-react";

const ITEMS_PER_PAGE = 4;

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
    prices: { small: "", medium: "", large: "", default: "" },
    image: null as string | null
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newProduct = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      name: formData.name,
      stock: parseFloat(formData.stock) || 0,
      barcode: formData.barcode,
      category_id: formData.category ? Number(formData.category) : null,
      hasSizes: formData.hasSizes,
      price: formData.hasSizes ? 0 : parseFloat(formData.prices.default) || 0,
      s_price: formData.hasSizes ? parseFloat(formData.prices.small) || 0 : 0,
      m_price: formData.hasSizes ? parseFloat(formData.prices.medium) || 0 : 0,
      l_price: formData.hasSizes ? parseFloat(formData.prices.large) || 0 : 0,
      image: formData.image,
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
      image: product.image || null,
    });
    setIsDialogOpen(true);
  };

  const getCategoryColor = (categoryId: any) => {
    const category = categories.find(c => Number(c.id) === Number(categoryId));
    return category?.color || "#6B7280";
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({ name: "", hasSizes: false, prices: { small: "", medium: "", large: "", default: "" }, stock: "", barcode: "", category: "", image: null });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Premium Dashboard Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-1/4 h-full bg-indigo-600/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tight">إدارة المنتجات</h2>
            <p className="text-slate-400 font-medium">تحكم كامل في مخزونك ومنتجاتك بكل سهولة</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full lg:w-auto">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl min-w-[140px]">
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">إجمالي المنتجات</p>
              <p className="text-2xl font-black text-white">{products.length}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl min-w-[140px]">
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">الفئات</p>
              <p className="text-2xl font-black text-white">{categories.length}</p>
            </div>
            <div className="bg-blue-600/20 backdrop-blur-md border border-blue-500/30 p-4 rounded-3xl min-w-[140px] hidden sm:block">
              <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-1">نقص المخزون</p>
              <p className="text-2xl font-black text-blue-400">{products.filter(p => p.stock < 5).length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Category Management - Secondary Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-200">التصنيفات</h3>
          </div>
          <CategoryManagement categories={categories} onCategoriesUpdate={setCategories} />
        </section>

        {/* Products Toolbar */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl">
            <div className="flex-1 w-full max-w-2xl">
              <ProductFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </div>
            <ProductDialog
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              editingProduct={editingProduct}
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              onSubmit={handleSubmit}
              onAddNewClick={resetForm}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categories={categories}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getCategoryColor={getCategoryColor}
              />
            ))}
          </div>

          {paginatedProducts.length === 0 && (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-bold text-slate-400">لا توجد منتجات مطابقة للبحث</h3>
              <p className="text-slate-400 mt-1">جرب كلمات بحث مختلفة أو أضف منتجاً جديداً</p>
            </div>
          )}

          <div className="flex justify-center pt-8">
            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductManagement;