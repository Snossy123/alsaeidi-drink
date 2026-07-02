import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Package, Minus, Plus } from "lucide-react";
import { getProductImageUrl } from "@/lib/constants";
import { Product, Category } from "@/types";

interface ProductCardProps {
  product: Product;
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onStockAdjust?: (productId: string | number, delta: number) => void;
  getCategoryColor: (categoryId: any) => string;
}

const ProductCard = ({
  product,
  categories,
  onEdit,
  onDelete,
  onStockAdjust,
  getCategoryColor
}: ProductCardProps) => {
  const categoryName = categories.find(c => Number(c.id) === product.category_id)?.name || "بدون فئة";
  const categoryColor = getCategoryColor(product.category_id);
  const imageUrl = getProductImageUrl(product.image);

  return (
    <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
      <div className="w-16 h-16 shrink-0 rounded-lg bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <Package className="w-6 h-6 text-slate-300 dark:text-slate-700" />
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">
              {product.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <Badge
                variant="secondary"
                className="text-[9px] font-black px-1.5 py-0 h-4 border-none"
                style={{ color: categoryColor, backgroundColor: `${categoryColor}15` }}
              >
                {categoryName}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[9px] font-black px-1.5 py-0 h-4 ${
                  product.stock < 5
                    ? "border-red-200 text-red-600 bg-red-50/50"
                    : "border-green-200 text-green-600 bg-green-50/50"
                }`}
              >
                مخزون: {product.stock}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600"
              onClick={() => onEdit(product)}
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500"
              onClick={() => onDelete(product.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {onStockAdjust && (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-6 w-6 rounded-md"
              onClick={() => onStockAdjust(product.id, -5)}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-[9px] font-bold text-slate-500 px-1">±5</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-6 w-6 rounded-md"
              onClick={() => onStockAdjust(product.id, 5)}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        )}

        {product.hasSizes ? (
          <div className="flex gap-1 flex-wrap">
            {[
              { l: "ص", v: product.s_price },
              { l: "و", v: product.m_price },
              { l: "ك", v: product.l_price },
            ].map((s, i) => (
              <span
                key={i}
                className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                {s.l}: {Number(s.v).toFixed(0)}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[11px] font-black text-blue-600 dark:text-blue-400">
            {Number(product.price).toFixed(2)} ج.م
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
