import { FormEvent, ChangeEvent, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Image as ImageIcon, X } from "lucide-react";
import { Category, Product } from "@/types";
import { compressImage } from "@/lib/imageUtils";
import { getProductImageUrl } from "@/lib/constants";

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
  const [imageError, setImageError] = useState(false);

  const previewUrl = formData.image ? getProductImageUrl(formData.image) : null;
  const showImage = previewUrl && !imageError;

  useEffect(() => {
    setImageError(false);
  }, [formData.image, isOpen]);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressing(true);
      setImageError(false);
      const compressedBase64 = await compressImage(file);
      setFormData({ ...formData, image: compressedBase64 });
    } catch (error) {
      console.error("Compression failed:", error);
    } finally {
      setCompressing(false);
    }
  };

  const removeImage = () => {
    setImageError(false);
    setFormData({ ...formData, image: null });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 font-bold shrink-0 h-9"
          onClick={onAddNewClick}
        >
          <Plus className="w-4 h-4 ml-1" /> إضافة منتج
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md w-[95vw] max-h-[90dvh] p-0 gap-0 overflow-hidden !flex !flex-col dark:bg-slate-900 dark:border-slate-800 rounded-2xl [&>div]:flex [&>div]:flex-col [&>div]:min-h-0 [&>div]:flex-1"
        dir="rtl"
      >
        <DialogHeader className="px-4 pt-4 pb-2 shrink-0 pe-14 ps-4">
          <DialogTitle className="text-lg font-black dark:text-white leading-tight">
            {editingProduct ? "تعديل" : "إضافة"} منتج
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="overflow-y-auto px-4 pb-3 space-y-3 max-h-[calc(90dvh-7.5rem)]">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="shrink-0 flex flex-col items-center sm:items-start">
                <Label className="dark:text-slate-300 text-xs mb-1.5 w-full">صورة المنتج</Label>
                {showImage ? (
                  <div className="relative w-full sm:w-28 h-28 rounded-xl overflow-hidden border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <img
                      src={previewUrl!}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={() => setImageError(true)}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 start-1 h-7 w-7 rounded-full shadow-sm"
                      onClick={removeImage}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ) : (
                  <label className="w-full sm:w-28 h-28 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors dark:bg-slate-800/50 group">
                    <ImageIcon className="w-7 h-7 text-slate-400 group-hover:text-blue-500" />
                    <span className="text-[10px] text-slate-400 group-hover:text-blue-500 mt-1 text-center px-1">
                      {compressing ? "جاري المعالجة..." : imageError ? "فشل التحميل — ارفع صورة" : "رفع صورة"}
                    </span>
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

              <div className="flex-1 min-w-0 space-y-3">
                <div className="space-y-1.5">
                  <Label className="dark:text-slate-300 text-xs">اسم المنتج *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="dark:bg-slate-800 dark:border-slate-700 h-9 text-sm dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 px-3 py-2">
                  <Label htmlFor="has-sizes" className="dark:text-slate-300 text-xs font-bold cursor-pointer">
                    يوجد أحجام مختلفة
                  </Label>
                  <Switch
                    id="has-sizes"
                    className="shrink-0"
                    checked={formData.hasSizes}
                    onCheckedChange={(c) => setFormData({ ...formData, hasSizes: c })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="dark:text-slate-300 text-xs">الكمية</Label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="dark:bg-slate-800 dark:border-slate-700 h-9 text-sm dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="dark:text-slate-300 text-xs">الفئة</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 h-9 text-sm dark:text-white">
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
              </div>
            </div>

            {!formData.hasSizes ? (
              <div className="space-y-1.5">
                <Label className="dark:text-slate-300 text-xs">السعر الافتراضي</Label>
                <Input
                  type="number"
                  value={formData.prices.default}
                  onChange={(e) => setFormData({
                    ...formData,
                    prices: { ...formData.prices, default: e.target.value }
                  })}
                  className="dark:bg-slate-800 dark:border-slate-700 h-9 text-sm dark:text-white"
                />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label className="dark:text-slate-300 text-xs">صغير</Label>
                  <Input
                    type="number"
                    value={formData.prices.small}
                    onChange={(e) => setFormData({
                      ...formData,
                      prices: { ...formData.prices, small: e.target.value }
                    })}
                    className="dark:bg-slate-800 dark:border-slate-700 h-9 text-sm dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="dark:text-slate-300 text-xs">وسط</Label>
                  <Input
                    type="number"
                    value={formData.prices.medium}
                    onChange={(e) => setFormData({
                      ...formData,
                      prices: { ...formData.prices, medium: e.target.value }
                    })}
                    className="dark:bg-slate-800 dark:border-slate-700 h-9 text-sm dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="dark:text-slate-300 text-xs">كبير</Label>
                  <Input
                    type="number"
                    value={formData.prices.large}
                    onChange={(e) => setFormData({
                      ...formData,
                      prices: { ...formData.prices, large: e.target.value }
                    })}
                    className="dark:bg-slate-800 dark:border-slate-700 h-9 text-sm dark:text-white"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="dark:text-slate-300 text-xs">الباركود</Label>
              <Input
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="dark:bg-slate-800 dark:border-slate-700 h-9 text-sm dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2 px-4 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white/80 dark:bg-slate-900/80">
            <Button type="submit" className="flex-1 bg-blue-600 h-9 text-sm font-bold">
              حفظ المنتج
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 text-sm dark:border-slate-700"
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
