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
import { useGridColumns } from "@/hooks/useGridColumns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProductManagement = () => {
  const { itemsPerPage } = useGridColumns();
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

  const filteredProducts = products.filter((product) => {
    const categoryName = categories.find((c) => Number(c.id) === product.category_id)?.name || "";
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    <div className="space-y-4 pb-4">
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-5 py-5 shadow-xl">
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">إدارة المنتجات</h2>
            <p className="text-slate-400 text-sm">تحكم في المخزون والفئات</p>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full lg:w-auto">
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl min-w-0">
              <p className="text-white/50 text-[9px] font-bold uppercase mb-0.5">المنتجات</p>
              <p className="text-lg font-black text-white">{products.length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl min-w-0">
              <p className="text-white/50 text-[9px] font-bold uppercase mb-0.5">الفئات</p>
              <p className="text-lg font-black text-white">{categories.length}</p>
            </div>
            <div className="bg-blue-600/20 border border-blue-500/30 p-3 rounded-xl min-w-0">
              <p className="text-blue-400 text-[9px] font-bold uppercase mb-0.5">نقص المخزون</p>
              <p className="text-lg font-black text-blue-400">{products.filter(p => p.stock < 5).length}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="products" dir="rtl" className="w-full">
        <TabsList className="w-full h-11 rounded-xl bg-slate-100 dark:bg-slate-900 p-1">
          <TabsTrigger value="products" className="flex-1 rounded-lg font-bold text-sm">
            المنتجات ({products.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex-1 rounded-lg font-bold text-sm">
            الفئات ({categories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-3">
          <CategoryManagement
            categories={categories}
            onCategoriesUpdate={setCategories}
            embedded
          />
        </TabsContent>

        <TabsContent value="products" className="mt-3 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex-1 w-full">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
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
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h3 className="text-base font-bold text-slate-400">لا توجد منتجات مطابقة للبحث</h3>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <ProductPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductManagement;
