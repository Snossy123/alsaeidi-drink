import { FormEvent, ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Image as ImageIcon, X } from "lucide-react";
import { Category, Product } from "@/types";
import { compressImage } from "@/lib/imageUtils";

interface ProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: Product | null;
  formData: any;
  setFormData: (data: any) => void;
  categories: Category[];
  onSubmit: (e: FormEvent) => void;
  onAddNewClick: () => void;
}

const ProductDialog = ({
  isOpen,
  onOpenChange,
  editingProduct,
  formData,
  setFormData,
  categories,
  onSubmit,
  onAddNewClick
}: ProductDialogProps) => {
  const [compressing, setCompressing] = useState(false);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressing(true);
      const compressedBase64 = await compressImage(file);
      setFormData({ ...formData, image: compressedBase64 });
    } catch (error) {
      console.error("Compression failed:", error);
    } finally {
      setCompressing(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-xl text-lg font-bold"
          onClick={onAddNewClick}
        >
          <Plus className="w-5 h-5 ml-2" /> إضافة منتج
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg dark:bg-slate-900 dark:border-slate-800" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl dark:text-white">
            {editingProduct ? "تعديل" : "إضافة"} منتج
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="dark:text-slate-300">صورة المنتج</Label>
            <div className="flex flex-col items-center gap-4">
              {formData.image ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-dashed border-slate-700">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={removeImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors dark:bg-slate-800/50 group">
                  <div className="flex flex-col items-center gap-2 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-10 h-10 text-slate-500 group-hover:text-blue-500" />
                    <span className="text-sm text-slate-500 group-hover:text-blue-500">
                      {compressing ? "جاري المعالجة..." : "اضغط لرفع صورة"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={compressing}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="dark:text-slate-300">اسم المنتج *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="dark:bg-slate-800 dark:border-slate-700 h-11 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-3 py-2">
            <Switch
              checked={formData.hasSizes}
              onCheckedChange={(c) => setFormData({ ...formData, hasSizes: c })}
            />
            <Label className="dark:text-slate-300">يوجد أحجام مختلفة</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="dark:text-slate-300">الكمية</Label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="dark:bg-slate-800 dark:border-slate-700 h-11 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-300">الفئة</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 h-11 dark:text-white">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!formData.hasSizes ? (
            <div className="space-y-2">
              <Label className="dark:text-slate-300">السعر الافتراضي</Label>
              <Input
                type="number"
                value={formData.prices.default}
                onChange={(e) => setFormData({
                  ...formData,
                  prices: { ...formData.prices, default: e.target.value }
                })}
                className="dark:bg-slate-800 dark:border-slate-700 h-11 dark:text-white"
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label className="dark:text-slate-300">صغير</Label>
                <Input
                  type="number"
                  value={formData.prices.small}
                  onChange={(e) => setFormData({
                    ...formData,
                    prices: { ...formData.prices, small: e.target.value }
                  })}
                  className="dark:bg-slate-800 dark:border-slate-700 h-11 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-300">وسط</Label>
                <Input
                  type="number"
                  value={formData.prices.medium}
                  onChange={(e) => setFormData({
                    ...formData,
                    prices: { ...formData.prices, medium: e.target.value }
                  })}
                  className="dark:bg-slate-800 dark:border-slate-700 h-11 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-300">كبير</Label>
                <Input
                  type="number"
                  value={formData.prices.large}
                  onChange={(e) => setFormData({
                    ...formData,
                    prices: { ...formData.prices, large: e.target.value }
                  })}
                  className="dark:bg-slate-800 dark:border-slate-700 h-11 dark:text-white"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="dark:text-slate-300">الباركود</Label>
            <Input
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              className="dark:bg-slate-800 dark:border-slate-700 h-11 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-6">
            <Button type="submit" className="flex-1 bg-blue-600 h-12 text-lg">
              حفظ المنتج
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 dark:border-slate-700"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
