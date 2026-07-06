import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Package, Minus, Plus } from "lucide-react";
import { getProductImageUrl } from "@/lib/constants";
import { cn } from "@/lib/utils";
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
  getCategoryColor,
}: ProductCardProps) => {
  const [imgError, setImgError] = useState(false);
  const categoryName = categories.find((c) => Number(c.id) === product.category_id)?.name || "بدون فئة";
  const categoryColor = getCategoryColor(product.category_id);
  const imageUrl = getProductImageUrl(product.image);
  const showImage = imageUrl && !imgError;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock < 5;

  return (
    <div className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-slate-50 dark:bg-slate-950/40 flex items-center justify-center overflow-hidden shrink-0">
        {showImage ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className={cn(
              "w-full h-full object-contain p-2 transition-transform group-hover:scale-105",
              isOutOfStock && "opacity-60 grayscale"
            )}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <Package className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            <span className="text-xs font-black text-slate-500 line-clamp-2">{product.name}</span>
          </div>
        )}

        {/* Actions overlay */}
        <div className="absolute top-1.5 left-1.5 flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 rounded-lg bg-white/90 dark:bg-slate-900/90 shadow-sm text-slate-500 hover:text-blue-600"
            onClick={() => onEdit(product)}
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 rounded-lg bg-white/90 dark:bg-slate-900/90 shadow-sm text-slate-500 hover:text-red-500"
            onClick={() => onDelete(product.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Stock badge */}
        <div
          className={cn(
            "absolute top-1.5 right-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm border",
            isOutOfStock
              ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800"
              : isLowStock
                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800"
                : "bg-white/90 text-green-700 border-green-200 dark:bg-slate-900/90 dark:text-green-400 dark:border-green-800"
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              isOutOfStock ? "bg-red-500" : isLowStock ? "bg-amber-500" : "bg-green-500"
            )}
          />
          {isOutOfStock ? "نفذ" : product.stock}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-2.5 gap-2 min-h-0">
        <div className="min-w-0">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate leading-tight">
            {product.name}
          </h3>
          <Badge
            variant="secondary"
            className="mt-1 text-[10px] font-black px-1.5 py-0 h-5 border-none"
            style={{ color: categoryColor, backgroundColor: `${categoryColor}18` }}
          >
            {categoryName}
          </Badge>
        </div>

        {onStockAdjust && (
          <div className="flex items-center justify-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={() => onStockAdjust(product.id, -5)}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-[10px] font-bold text-slate-400 tabular-nums min-w-[2rem] text-center">
              ±5
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={() => onStockAdjust(product.id, 5)}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        )}

        <div className="mt-auto">
          {product.hasSizes ? (
            <div className="grid grid-cols-3 gap-1">
              {[
                { l: "ص", v: product.s_price },
                { l: "و", v: product.m_price },
                { l: "ك", v: product.l_price },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60"
                >
                  <span className="text-[9px] font-black text-slate-400">{s.l}</span>
                  <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 tabular-nums">
                    {Number(s.v).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-blue-600/5 border border-blue-600/10 py-1.5 text-center">
              <span className="text-sm font-black text-blue-600 dark:text-blue-400 tabular-nums">
                {Number(product.price).toFixed(2)} <span className="text-[10px]">ج.م</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
