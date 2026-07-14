import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

export type ModifierRow = {
  id: number;
  name: string;
  price: number;
  active: boolean;
  category_ids: number[];
  categories?: { id: number; name: string }[];
};

interface ModifiersManagementProps {
  categories: { id: string | number; name: string }[];
  onCategoriesRefresh?: () => void | Promise<void>;
}

const ModifiersManagement = ({ categories, onCategoriesRefresh }: ModifiersManagementProps) => {
  const { toast } = useToast();
  const [modifiers, setModifiers] = useState<ModifierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ModifierRow | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "0",
    active: true,
    category_ids: [] as number[],
  });

  const loadModifiers = async () => {
    try {
      setLoading(true);
      const data = await apiClient<{ status: string; modifiers: ModifierRow[] }>("/modifiers");
      setModifiers(data.modifiers || []);
    } catch {
      toast({ title: "فشل تحميل الإضافات", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadModifiers();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setFormData({ name: "", price: "0", active: true, category_ids: [] });
  };

  const openAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEdit = (mod: ModifierRow) => {
    setEditing(mod);
    setFormData({
      name: mod.name,
      price: String(mod.price ?? 0),
      active: mod.active !== false,
      category_ids: (mod.category_ids || []).map(Number),
    });
    setIsDialogOpen(true);
  };

  const toggleCategory = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter((x) => x !== id)
        : [...prev.category_ids, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: "اسم الإضافة مطلوب", variant: "destructive" });
      return;
    }

    const payload = {
      id: editing?.id,
      name: formData.name.trim(),
      price: parseFloat(formData.price) || 0,
      active: formData.active,
      category_ids: formData.category_ids,
    };

    try {
      const data = await apiClient<{ success: boolean; modifiers: ModifierRow[]; message?: string }>(
        "/modifiers",
        {
          method: "POST",
          body: JSON.stringify({
            action: editing ? "update" : "add",
            modifier: payload,
          }),
        }
      );
      if (!data.success) {
        toast({ title: data.message || "فشل الحفظ", variant: "destructive" });
        return;
      }
      setModifiers(data.modifiers || []);
      setIsDialogOpen(false);
      resetForm();
      await onCategoriesRefresh?.();
      toast({ title: "تم حفظ الإضافة" });
    } catch (error: any) {
      toast({ title: error.message || "تعذر الاتصال بالخادم", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("حذف هذه الإضافة؟")) return;
    try {
      const data = await apiClient<{ success: boolean; modifiers: ModifierRow[] }>("/modifiers", {
        method: "POST",
        body: JSON.stringify({ action: "delete", id }),
      });
      if (data.success) {
        setModifiers(data.modifiers || []);
        await onCategoriesRefresh?.();
        toast({ title: "تم الحذف" });
      }
    } catch {
      toast({ title: "فشل الحذف", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3" dir="rtl">
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div>
          <h3 className="text-sm font-black text-slate-800 dark:text-white">إضافات المنتجات</h3>
          <p className="text-[11px] font-bold text-slate-400">
            اربط كل إضافة بالتصنيفات المناسبة — تظهر كأزرار سريعة عند البيع
          </p>
        </div>
        <Button onClick={openAdd} className="rounded-xl font-black gap-1.5 h-9">
          <Plus className="w-4 h-4" />
          إضافة
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
        {loading ? (
          <p className="text-sm font-bold text-slate-400 text-center py-10">جاري التحميل...</p>
        ) : modifiers.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <Sparkles className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-400">لا توجد إضافات بعد</p>
          </div>
        ) : (
          modifiers.map((mod) => (
            <div
              key={mod.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black text-slate-800 dark:text-white truncate">{mod.name}</p>
                  {!mod.active && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      متوقف
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                  {Number(mod.price) > 0 ? `+${Number(mod.price).toFixed(2)} ج.م` : "مجاني"}
                  {(mod.categories?.length || mod.category_ids?.length)
                    ? ` · ${(mod.categories || [])
                        .map((c) => c.name)
                        .join("، ") || `${mod.category_ids.length} تصنيف`}`
                    : " · غير مربوط بتصنيف"}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(mod)}>
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500"
                  onClick={() => handleDelete(mod.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto dark:bg-slate-900 sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              {editing ? "تعديل إضافة" : "إضافة جديدة"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>الاسم</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="مثلاً: فانيليا / بدون سكر / مزيد آيس"
                className="font-bold"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>السعر الإضافي (0 = مجاني)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                className="font-bold tabular-nums"
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2">
              <Label htmlFor="mod-active">نشطة</Label>
              <Switch
                id="mod-active"
                checked={formData.active}
                onCheckedChange={(v) => setFormData((p) => ({ ...p, active: v }))}
              />
            </div>
            <div className="space-y-2">
              <Label>التصنيفات المرتبطة</Label>
              {categories.length === 0 ? (
                <p className="text-xs font-bold text-slate-400">أضف تصنيفات أولاً</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {categories.map((cat) => {
                    const id = Number(cat.id);
                    const selected = formData.category_ids.includes(id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(id)}
                        className={cn(
                          "min-h-[40px] rounded-xl border-2 px-2 py-1.5 text-xs font-black transition-all",
                          selected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        )}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl font-black">
              {editing ? "حفظ التعديلات" : "إضافة"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModifiersManagement;
