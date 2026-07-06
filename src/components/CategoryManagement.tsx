import { useState, useRef, useEffect } from "react";
import { useGridCategoryItemsPerPage } from "@/hooks/useGridCategoryItemsPerPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Tag, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import ProductPagination from "./product-management/ProductPagination";

interface CategoryManagementProps {
  categories: any[];
  onCategoriesUpdate: (categories: any[]) => void;
  embedded?: boolean;
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316"];

const CategoryManagement = ({ categories, onCategoriesUpdate, embedded = false }: CategoryManagementProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = useGridCategoryItemsPerPage(gridRef);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
  });

  const { toast } = useToast();

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

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", color: "#3B82F6" });
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCategory = {
      id: editingCategory ? editingCategory.id : Date.now().toString(),
      name: formData.name,
      description: formData.description,
      color: formData.color,
    };

    try {
      const data = await apiClient<{ success: boolean; categories: any[] }>("/categories", {
        method: "POST",
        body: JSON.stringify({ action: editingCategory ? "update" : "add", category: newCategory }),
      });
      if (data.success) {
        onCategoriesUpdate(data.categories);
        setIsDialogOpen(false);
        resetForm();
        toast({ title: "تم حفظ الفئة بنجاح" });
      }
    } catch {
      toast({ title: "تعذر الاتصال بالخادم", variant: "destructive" });
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الفئة؟")) return;
    try {
      const data = await apiClient<{ success: boolean; categories: any[] }>("/categories", {
        method: "POST",
        body: JSON.stringify({ action: "delete", id }),
      });
      if (data.success) onCategoriesUpdate(data.categories);
    } catch {
      toast({ title: "فشل الحذف", variant: "destructive" });
    }
  };

  const dialog = (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto dark:bg-slate-900 dark:border-slate-800 sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            {editingCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="dark:text-slate-300">اسم الفئة *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="dark:text-slate-300">وصف اختياري</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="h-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="dark:text-slate-300">لون الفئة</Label>
            <div className="flex flex-wrap gap-2 pt-1">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    "w-9 h-9 rounded-full border-2 transition-transform active:scale-90",
                    formData.color === color ? "border-blue-600 scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1 h-10 bg-blue-600 hover:bg-blue-700">
              حفظ
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="h-10 dark:border-slate-700 dark:text-slate-300"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  const addButton = (
    <Button onClick={openAddDialog} className="h-10 shrink-0 bg-blue-600 hover:bg-blue-700 font-bold text-sm px-4 rounded-xl">
      <Plus className="w-4 h-4 ml-1.5" />
      إضافة فئة
    </Button>
  );

  const gridContent = (
    <>
      <div
        ref={gridRef}
        className={cn(
          "flex-1 min-h-0 overflow-y-auto overscroll-y-contain",
          embedded ? "" : "p-1"
        )}
      >
        {categories.length === 0 ? (
          <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <Layers className="w-10 h-10 mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-400">لا توجد فئات — أضف فئة جديدة</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 pb-2">
            {paginatedCategories.map((category) => (
              <div
                key={category.id}
                className="group relative flex flex-col items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow min-h-[108px]"
              >
                <div className="w-full h-1.5 shrink-0" style={{ backgroundColor: category.color }} />

                <div className="flex flex-col flex-1 items-center justify-center gap-2 p-3 w-full min-h-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${category.color}22` }}
                  >
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                  </div>
                  <p className="font-black text-xs sm:text-sm text-slate-700 dark:text-slate-200 text-center line-clamp-2 leading-tight w-full px-1">
                    {category.name}
                  </p>
                  {category.description && (
                    <p className="text-[10px] text-slate-400 text-center line-clamp-1 w-full px-1">
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="absolute top-2 left-2 flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => handleEdit(category)}
                    className="h-7 w-7 rounded-lg bg-white/90 dark:bg-slate-900/90 shadow-sm text-slate-500 hover:text-blue-600"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => handleDelete(category.id)}
                    className="h-7 w-7 rounded-lg bg-white/90 dark:bg-slate-900/90 shadow-sm text-slate-500 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 pt-1">
        <ProductPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );

  if (embedded) {
    return (
      <div className="flex flex-col flex-1 min-h-0 h-full gap-3">
        <div className="shrink-0 flex justify-end">{addButton}</div>
        {gridContent}
        {dialog}
      </div>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full min-h-0">
      <CardHeader className="py-3 px-4 border-b dark:border-slate-800 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-400 text-base">
            <Tag className="w-4 h-4" />
            إدارة الفئات
          </CardTitle>
          {addButton}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-h-0 p-3 gap-0">
        {gridContent}
      </CardContent>
      {dialog}
    </Card>
  );
};

export default CategoryManagement;
