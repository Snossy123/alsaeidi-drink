import { useState } from "react";
import { Search, Package, ChevronLeft, ChevronRight, ArrowRight, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getProductImageUrl } from "@/lib/constants";
import { getProductSizeOptions } from "@/lib/productSizes";
import type { Category } from "@/hooks/useSalesData";

/**
 * Product Interface
 */
interface Product {
  id: string | number;
  name: string;
  image?: string;
  stock: number;
  price?: number;
  s_price?: number;
  m_price?: number;
  l_price?: number;
  hasSizes: boolean;
  category_id?: string | number;
}

export type ProductBrowseStep = "categories" | "products";

interface ProductGridProps {
  searchTerm: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  paginatedProducts: Product[];
  handleProductClick: (product: Product) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  categoryColorMap?: Record<string, string>;
  categories: Category[];
  browseStep: ProductBrowseStep;
  selectedCategoryName?: string;
  onSelectCategory: (categoryId: string | null) => void;
  onBackToCategories: () => void;
}

const FALLBACK_ACCENT = "#64748b";

/**
 * ProductGridHeader - Search and Title section
 */
const ProductGridHeader = ({
  searchTerm,
  handleSearchChange,
  browseStep,
  selectedCategoryName,
  onBackToCategories,
}: {
  searchTerm: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  browseStep: ProductBrowseStep;
  selectedCategoryName?: string;
  onBackToCategories: () => void;
}) => (
  <CardHeader className="py-2 px-3 shrink-0 border-b border-slate-300 dark:border-slate-800/50">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
        {browseStep === "products" && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl border-2"
            onClick={onBackToCategories}
            aria-label="رجوع للفئات"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
        )}
        <div className="bg-blue-600/10 p-1.5 rounded-lg shrink-0">
          {browseStep === "categories" ? (
            <LayoutGrid className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          )}
        </div>
        <div className="min-w-0">
          <CardTitle className="text-lg font-black text-slate-800 dark:text-white tracking-tight truncate">
            {browseStep === "categories" ? "اختر الفئة" : selectedCategoryName || "كل المنتجات"}
          </CardTitle>
          {browseStep === "categories" && (
            <p className="text-xs font-bold text-slate-500">ثم اختر المنتج</p>
          )}
        </div>
      </div>

      {browseStep === "products" && (
        <div className="relative w-full sm:w-56 group">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-all" />
          <Input
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="ابحث..."
            className="h-10 pr-9 bg-slate-200 dark:bg-slate-950 border-slate-300 dark:border-slate-800 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/20 font-bold w-full text-base placeholder:text-slate-500"
          />
        </div>
      )}
    </div>
  </CardHeader>
);

/**
 * ProductCard - Individual product display
 */
const ProductCard = ({
  product,
  onClick,
  accentColor,
}: {
  product: Product;
  onClick: () => void;
  accentColor: string;
}) => {
  const isOutOfStock = product.stock <= 0;
  const [imgError, setImgError] = useState(false);
  const imageUrl = getProductImageUrl(product.image);
  const showImage = imageUrl && !imgError;
  const sizeOptions = getProductSizeOptions(product);
  const showSizePrices = product.hasSizes && sizeOptions.length > 0;
  const accent = accentColor || FALLBACK_ACCENT;

  return (
    <div
      className="group relative border-2 rounded-lg overflow-hidden transition-shadow duration-300 cursor-pointer active:scale-[0.98] h-full flex flex-col text-white"
      style={{
        backgroundColor: accent,
        borderColor: accent,
        boxShadow: `${accent}55 0 8px 18px`,
      }}
      onClick={onClick}
    >
      <div className="aspect-square w-full min-h-0 flex-1 flex items-center justify-center relative overflow-hidden">
        {showImage ? (
          <>
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 z-10 bg-black/80 pt-1 pb-1 px-1 pointer-events-none">
              <span className="block text-right text-white font-black text-base leading-snug line-clamp-2">
                {product.name}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 w-full h-full p-1.5 text-center">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-white/90 ring-2 ring-white/40" />
              <Package className="w-4 h-4 text-white/80 shrink-0" />
            </div>
            <span className="text-xl font-black text-white leading-snug line-clamp-4">
              {product.name}
            </span>
          </div>
        )}

        <div
          className={cn(
            "absolute top-1 left-1 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-full shadow-sm border",
            isOutOfStock
              ? "bg-red-500 border-red-600 text-white"
              : "bg-slate-100/95 dark:bg-slate-900 border-slate-300 dark:border-slate-800"
          )}
        >
          {!isOutOfStock && (
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: accent }}
              title="لون الفئة"
            />
          )}
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              isOutOfStock ? "bg-white" : "bg-green-500"
            )}
          />
          <span
            className={cn(
              "text-sm font-black uppercase",
              isOutOfStock ? "text-white" : "text-slate-700 dark:text-slate-300"
            )}
          >
            {isOutOfStock ? "نفذت" : `${product.stock}`}
          </span>
        </div>
      </div>

      <div className="p-1 flex flex-col gap-0.5 shrink-0">
        {showSizePrices ? (
          <div
            className={cn(
              "grid gap-0.5",
              sizeOptions.length === 1 && "grid-cols-1",
              sizeOptions.length === 2 && "grid-cols-2",
              sizeOptions.length === 3 && "grid-cols-3"
            )}
          >
            {sizeOptions.map((size) => (
              <div
                key={size.key}
                className="flex flex-col items-center min-w-0 py-0.5 rounded-md bg-black/20"
              >
                <span className="text-sm font-black uppercase text-white">
                  {size.key === "s" ? "ص" : size.key === "m" ? "و" : "ك"}
                </span>
                <span className="text-base font-black text-white tabular-nums truncate w-full text-center">
                  {size.price}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-1 rounded-md flex items-center justify-center mt-auto bg-black/25 border border-white/20">
            <span className="font-black text-lg text-white">
              {product.price} <small className="text-sm">ج</small>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * PaginationFooter - Navigation controls
 */
const PaginationFooter = ({ currentPage, totalPages, setCurrentPage }: {
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}) => (
  <CardFooter className="py-2 px-3 border-t border-slate-300 dark:border-slate-800/50 flex justify-between items-center shrink-0 bg-slate-200/70 dark:bg-slate-950">
    <Button
      variant="default"
      size="icon"
      className="h-10 w-10 rounded-md bg-blue-600 hover:bg-blue-500 text-white border-2 border-blue-700 shadow-md active:scale-90 transition-all disabled:opacity-40"
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
    >
      <ChevronRight className="h-5 w-5" />
    </Button>

    <div className="flex flex-col items-center gap-1">
      <div className="h-1.5 w-20 bg-slate-300 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${(currentPage / (totalPages || 1)) * 100}%` }}
        />
      </div>
      <span className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-widest uppercase">
        {currentPage} / {totalPages || 1}
      </span>
    </div>

    <Button
      variant="default"
      size="icon"
      className="h-10 w-10 rounded-md bg-blue-600 hover:bg-blue-500 text-white border-2 border-blue-700 shadow-md active:scale-90 transition-all disabled:opacity-40"
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages || totalPages === 0}
    >
      <ChevronLeft className="h-5 w-5" />
    </Button>
  </CardFooter>
);

export const ProductGrid = ({
  searchTerm,
  handleSearchChange,
  paginatedProducts,
  handleProductClick,
  currentPage,
  setCurrentPage,
  totalPages,
  categoryColorMap = {},
  categories,
  browseStep,
  selectedCategoryName,
  onSelectCategory,
  onBackToCategories,
}: ProductGridProps) => {
  return (
    <div className="h-full flex flex-col bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg isolate">
      <ProductGridHeader
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
        browseStep={browseStep}
        selectedCategoryName={selectedCategoryName}
        onBackToCategories={onBackToCategories}
      />

      <CardContent className="flex-1 overflow-hidden p-2 relative z-10 min-h-0">
        {browseStep === "categories" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-3 h-full content-start overflow-y-auto">
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className="min-h-[100px] rounded-2xl border-2 border-slate-800 bg-slate-900 text-white font-black text-2xl px-3 py-5 flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md"
            >
              <LayoutGrid className="w-7 h-7" />
              الكل
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(String(cat.id))}
                className="min-h-[100px] rounded-2xl border-2 font-black text-2xl px-3 py-5 flex items-center justify-center active:scale-[0.98] transition-all text-white shadow-md"
                style={{
                  backgroundColor: cat.color || "#334155",
                  borderColor: cat.color || "#1e293b",
                  boxShadow: cat.color ? `${cat.color}55 0 8px 18px` : undefined,
                }}
              >
                <span className="leading-tight text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="bg-slate-200 dark:bg-slate-800/50 p-4 rounded-2xl mb-3">
              <Package className="w-10 h-10 text-slate-400 dark:text-slate-600" />
            </div>
            <p className="text-base font-black text-slate-600 dark:text-slate-500">
              لا توجد منتجات
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8 gap-1.5 h-full content-start">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                accentColor={
                  product.category_id != null
                    ? categoryColorMap[String(product.category_id)] || FALLBACK_ACCENT
                    : FALLBACK_ACCENT
                }
                onClick={() => handleProductClick(product)}
              />
            ))}
          </div>
        )}
      </CardContent>

      {browseStep === "products" && (
        <PaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};
