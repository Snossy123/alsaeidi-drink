import { useState, useRef, useEffect } from "react";
import { useGridCategoryItemsPerPage } from "@/hooks/useGridCategoryItemsPerPage";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Tag, Package, ChevronRight, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/constants";

interface CategoryManagementProps {
  categories: any[];
  onCategoriesUpdate: (categories: any[]) => void;
  embedded?: boolean;
}

const CategoryManagement = ({ categories, onCategoriesUpdate, embedded = false }: CategoryManagementProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = useGridCategoryItemsPerPage(gridRef);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6"
  });

  const { toast } = useToast();
  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316"];
  const API_URL = API_BASE_URL + "/categories";

  const totalPages = Math.max(1, Math.ceil(categories.length / itemsPerPage));
  const paginatedCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCategory = {
      id: editingCategory ? editingCategory.id : Date.now().toString(),
      name: formData.name,
      description: formData.description,
      color: formData.color,
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: editingCategory ? "update" : "add", category: newCategory }),
      });
      const data = await response.json();
      if (data.success) {
        onCategoriesUpdate(data.categories);
        setIsDialogOpen(false);
        setEditingCategory(null);
        setFormData({ name: "", description: "", color: "#3B82F6" });
        toast({ title: "نجاح", description: "تم حفظ التعديلات" });
      }
    } catch (error) {
      toast({ title: "خطأ", description: "تعذر الاتصال بالخادم", variant: "destructive" });
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || "", color: category.color });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الفئة؟")) return;
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await response.json();
      if (data.success) onCategoriesUpdate(data.categories);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل الحذف", variant: "destructive" });
    }
  };

  return (
    <Card className={`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${embedded ? "border-none shadow-none" : ""}`}>
      <CardHeader className={`py-3 px-4 border-b dark:border-slate-800 ${embedded ? "px-0 pt-0" : ""}`}>
        <div className={`flex items-center ${embedded ? "justify-end" : "justify-between"}`}>
          {!embedded && (
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-400 text-base">
              <Tag className="w-4 h-4" />
              إدارة الفئات
            </CardTitle>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-9">
                <Plus className="w-4 h-4 ml-1" /> إضافة فئة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90dvh] overflow-y-auto dark:bg-slate-900 dark:border-slate-800" dir="rtl">
              <DialogHeader>
                <DialogTitle className="dark:text-white">{editingCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="dark:text-slate-300">اسم الفئة *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-slate-300">وصف اختياري</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-slate-300">لون الفئة</Label>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-90 ${formData.color === color ? 'border-blue-600 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-blue-600">حفظ</Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="dark:border-slate-700 dark:text-slate-300">إلغاء</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent ref={gridRef} className={`p-3 ${embedded ? "px-0" : ""}`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-2">
          {paginatedCategories.map((category) => (
            <div
              key={category.id}
              className="relative p-2 bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 overflow-hidden"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category.color }} />
              </div>

              <p className="font-black text-[11px] text-slate-700 dark:text-slate-200 text-center truncate w-full px-1">
                {category.name}
              </p>

              <div className="flex gap-1 absolute top-1 left-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleEdit(category)}
                  className="h-7 w-7 text-slate-400 hover:text-blue-500 rounded-lg bg-white/90 dark:bg-slate-950 shadow-sm"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(category.id)}
                  className="h-7 w-7 text-slate-400 hover:text-red-500 rounded-lg bg-white/90 dark:bg-slate-950 shadow-sm"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-8 opacity-40">
            <Package className="w-10 h-10 mx-auto mb-2 dark:text-slate-400" />
            <p className="dark:text-slate-400 text-sm font-medium">لا توجد فئات</p>
          </div>
        )}
      </CardContent>

      {totalPages > 1 && (
        <CardFooter className="py-3 border-t dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg dark:border-slate-700 dark:text-slate-300"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            صفحة {currentPage} من {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg dark:border-slate-700 dark:text-slate-300"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CategoryManagement;
