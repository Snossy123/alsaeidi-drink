import { useState, useEffect, useRef, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { Category, Product } from "@/types";

import CategoryManagement from "./CategoryManagement";
import ProductDialog from "./product-management/ProductDialog";
import ProductFilters from "./product-management/ProductFilters";
import ProductCard from "./product-management/ProductCard";
import ProductPagination from "./product-management/ProductPagination";
import { Package } from "lucide-react";
import { useProductGridItemsPerPage } from "@/hooks/useProductGridItemsPerPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProductManagement = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = useProductGridItemsPerPage(gridRef);
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          apiClient<{ products: Product[] }>("/products"),
          apiClient<{ categories: Category[] }>("/categories"),
        ]);
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

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (formData.hasSizes) {
      const hasAnySizePrice = [formData.prices.small, formData.prices.medium, formData.prices.large]
        .some((value) => parseFloat(value) > 0);

      if (!hasAnySizePrice) {
        toast({
          title: "أسعار الأحجام مطلوبة",
          description: "يرجى إدخال سعر واحد على الأقل عند تفعيل الأحجام المختلفة",
          variant: "destructive",
        });
        return;
      }
    }

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
      const data = await apiClient<{ success: boolean; products: Product[] }>("/products", {
        method: "POST",
        body: JSON.stringify({ action: editingProduct ? "update" : "add", product: newProduct }),
      });
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
      const data = await apiClient<{ success: boolean; products: Product[] }>("/products", {
        method: "POST",
        body: JSON.stringify({ action: "delete", id }),
      });
      if (data.success) setProducts(data.products);
    } catch (error) {
      toast({ title: "خطأ في الحذف", variant: "destructive" });
    }
  };

  const handleStockAdjust = async (productId: string | number, delta: number) => {
    try {
      const data = await apiClient<{ success: boolean; products: Product[] }>(`/products/${productId}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ delta }),
      });
      if (data.success) {
        setProducts(data.products);
        toast({ title: delta > 0 ? "تم زيادة المخزون" : "تم تقليل المخزون" });
      }
    } catch (error) {
      toast({ title: "فشل تحديث المخزون", variant: "destructive" });
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
    <div className="flex flex-col h-full min-h-0 gap-2">
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-4 py-3 shadow-xl shrink-0">
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">إدارة المنتجات</h2>
            <p className="text-slate-400 text-xs">تحكم في المخزون والفئات</p>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full lg:w-auto">
            <div className="bg-white/5 border border-white/10 p-2 rounded-xl min-w-0">
              <p className="text-white/50 text-[9px] font-bold uppercase mb-0.5">المنتجات</p>
              <p className="text-base font-black text-white">{products.length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-2 rounded-xl min-w-0">
              <p className="text-white/50 text-[9px] font-bold uppercase mb-0.5">الفئات</p>
              <p className="text-base font-black text-white">{categories.length}</p>
            </div>
            <div className="bg-blue-600/20 border border-blue-500/30 p-2 rounded-xl min-w-0">
              <p className="text-blue-400 text-[9px] font-bold uppercase mb-0.5">نقص المخزون</p>
              <p className="text-base font-black text-blue-400">{products.filter(p => p.stock < 5).length}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="products" dir="rtl" className="flex flex-col flex-1 min-h-0 w-full">
        <TabsList className="w-full h-10 rounded-xl bg-slate-100 dark:bg-slate-900 p-1 shrink-0">
          <TabsTrigger value="products" className="flex-1 rounded-lg font-bold text-sm">
            المنتجات ({products.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex-1 rounded-lg font-bold text-sm">
            الفئات ({categories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="flex-1 min-h-0 mt-2 data-[state=inactive]:hidden">
          <CategoryManagement
            categories={categories}
            onCategoriesUpdate={setCategories}
            embedded
          />
        </TabsContent>

        <TabsContent value="products" className="flex flex-col flex-1 min-h-0 mt-2 data-[state=inactive]:hidden">
          <div className="flex flex-col md:flex-row gap-2 items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
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

          <div ref={gridRef} className="flex-1 min-h-0 mt-2">
            {paginatedProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <Package className="w-10 h-10 mb-2 text-slate-300" />
                <h3 className="text-sm font-bold text-slate-400">لا توجد منتجات مطابقة للبحث</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 h-full content-start">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categories={categories}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onStockAdjust={handleStockAdjust}
                    getCategoryColor={getCategoryColor}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="shrink-0">
            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductManagement;
