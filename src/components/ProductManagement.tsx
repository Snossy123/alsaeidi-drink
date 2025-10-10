
import { useState, useEffect, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Search, Edit, Trash2, Barcode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CategoryManagement from "./CategoryManagement";
import { API_BASE_URL } from "@/lib/constants";
import { Switch } from "@/components/ui/switch";


interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  s_price: number;
  m_price: number;
  l_price: number;
  hasSizes: boolean;
  stock: number;
  barcode?: string;
  category?: string;
  category_id?: number;
}

const ProductManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  const generateBarcode = () => {
    const barcode = Math.floor(Math.random() * 1000000000).toString();
    setFormData({ ...formData, barcode });
  };

  // ✅ جلب المنتجات والفئات من السيرفر عند فتح الصفحة
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
        toast({
          title: "خطأ في الاتصال",
          description: "تعذر تحميل البيانات من الخادم",
          variant: "destructive"
        });
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name || 
       (!formData.hasSizes && !formData.prices.default) ||
       (formData.hasSizes && !formData.prices.small && !formData.prices.medium && !formData.prices.large)) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      name: formData.name,
      stock: parseFloat(formData.stock) || 0,
      barcode: formData.barcode,
      category: formData.category ? String(formData.category) : undefined,
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
        body: JSON.stringify({
          action: editingProduct ? "update" : "add",
          product: {
            ...newProduct,
            category: Number(newProduct.category) || null, 
          },
        })
      });
      if (!response.ok) throw new Error("Server error");
      const data = await response.json();
      if (data.success) {
        toast({
          title: editingProduct ? "تم تحديث المنتج" : "تم إضافة المنتج",
          description: data.message
        });
        setProducts(data.products);
        setIsDialogOpen(false);
        setEditingProduct(null);
        setFormData({
          name: "",
          stock: "",
          barcode: "",
          category: "",
          hasSizes: false,
          prices: { small: "", medium: "", large: "", default: "" },
        });
      } else {
        toast({ title: "فشل العملية", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر الاتصال بالخادم",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(API_PRODUCTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id })
      });
      if (!response.ok) throw new Error("Server error");
      const data = await response.json();
      if (data.success) {
        toast({ title: "تم حذف المنتج", description: data.message });
        setProducts(data.products);
      } else {
        toast({ title: "فشل الحذف", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر الاتصال بالخادم",
        variant: "destructive"
      });
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
        ? {
            small: product.s_price?.toString() || "",
            medium: product.m_price?.toString() || "",
            large: product.l_price?.toString() || "",
            default: "",
          }
        : { small: "", medium: "", large: "", default: product.price.toString() },
    });
    setIsDialogOpen(true);
  };


  const filteredProducts = products.filter((product) => {
    const categoryName =
      categories.find((c) => c.id === String(product.category))?.name || "";
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });


  const getCategoryColor = (categoryId: number) => {
    const category = categories.find(c => Number(c.id) === categoryId);
    return category?.color || "#6B7280";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-blue-800">إدارة المنتجات</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              onClick={() => {
                setEditingProduct(null);
                setFormData({ name: "", hasSizes: false, prices: { small: "", medium: "", large: "", default: "" }, stock: "", barcode: "", category: "" });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              إضافة منتج جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-right">اسم المنتج *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسم المنتج"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <Label>هل للمنتج أحجام؟</Label>
                <Switch
                  checked={formData.hasSizes}
                  onCheckedChange={(checked) => 
                    setFormData({
                      ...formData,
                      hasSizes: checked,
                      prices: { small: "", medium: "", large: "", default: "" },
                    })
                  }
                />
              </div>
              {formData.hasSizes ? (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label>صغير</Label>
                    <Input
                      type="number"
                      value={formData.prices.small}
                      onChange={(e) =>
                        setFormData({ ...formData, prices: { ...formData.prices, small: e.target.value } })
                      }
                    />
                  </div>
                  <div>
                    <Label>وسط</Label>
                    <Input
                      type="number"
                      value={formData.prices.medium}
                      onChange={(e) =>
                        setFormData({ ...formData, prices: { ...formData.prices, medium: e.target.value } })
                      }
                    />
                  </div>
                  <div>
                    <Label>كبير</Label>
                    <Input
                      type="number"
                      value={formData.prices.large}
                      onChange={(e) =>
                        setFormData({ ...formData, prices: { ...formData.prices, large: e.target.value } })
                      }
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Label>السعر</Label>
                  <Input
                    type="number"
                    value={formData.prices.default}
                    onChange={(e) =>
                      setFormData({ ...formData, prices: {
                        default: e.target.value,
                        small: "",
                        medium: "",
                        large: ""
                      } })
                    }
                    placeholder="0.00"
                  />
                </div>
              )}


              <div>
                <Label htmlFor="stock" className="text-right">الكمية المتوفرة</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="barcode" className="text-right">الباركود</Label>
                <div className="flex gap-2">
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="الباركود"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={generateBarcode}>
                    <Barcode className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="category" className="text-right mb-2 block">الفئة</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500">
                  {editingProduct ? "تحديث" : "إضافة"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Management */}
      <CategoryManagement 
        categories={categories}
        onCategoriesUpdate={setCategories}
      />

      {/* Search */}
      <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن المنتجات..."
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="bg-white/80 backdrop-blur-sm border-blue-100 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-gray-800">{product.name}</CardTitle>
                {product.category && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs text-white border-0"
                    style={{ backgroundColor: getCategoryColor(product.category_id) }}
                  >
                    {product.category}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* 🧮 Prices Section */}
              {product.hasSizes ? (
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "صغير", value: product.s_price, color: "from-blue-100 to-blue-50" },
                    { label: "وسط", value: product.m_price, color: "from-purple-100 to-purple-50" },
                    { label: "كبير", value: product.l_price, color: "from-emerald-100 to-emerald-50" },
                  ].map((size, i) => (
                    <div
                      key={i}
                      className={`rounded-xl py-2 bg-gradient-to-b ${size.color} border border-blue-100 hover:shadow-md transition-all`}
                    >
                      <div className="text-xs text-gray-500">{size.label}</div>
                      <div className="text-sm font-bold text-blue-700">
                        {size.value ? `${Number(size.value).toFixed(2)} ج` : "--"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">السعر:</span>
                  <span className="font-bold text-blue-600">{Number(product.price).toFixed(2)} ج</span>
                </div>
              )}


              {/* 🏷️ Stock */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">المخزون:</span>
                <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                  {product.stock}
                </Badge>
              </div>

              {/* 🧾 Barcode */}
              {product.barcode && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">الباركود:</span>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {product.barcode}
                  </span>
                </div>
              )}

              {/* 🧰 Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(product)}
                  className="flex-1"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  تعديل
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">لا توجد منتجات متاحة</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductManagement;
