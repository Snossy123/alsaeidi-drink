import { useState } from "react";
import { Search, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getProductImageUrl } from "@/lib/constants";
import { getProductSizeOptions } from "@/lib/productSizes";

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
  category_id?: string;
}

interface ProductGridProps {
  searchTerm: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  paginatedProducts: Product[];
  handleProductClick: (product: Product) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

/**
 * ProductGridHeader - Search and Title section
 */
const ProductGridHeader = ({ searchTerm, handleSearchChange }: {
  searchTerm: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => (
  <CardHeader className="py-2 px-3 shrink-0 border-b border-slate-100 dark:border-slate-800/50">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600/10 p-1.5 rounded-lg">
          <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle className="text-sm font-black text-slate-800 dark:text-white tracking-tight">
          المنتجات
        </CardTitle>
      </div>

      <div className="relative w-full sm:w-56 group">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-all" />
        <Input
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="ابحث..."
          className="h-8 pr-8 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/20 font-bold w-full text-xs placeholder:text-slate-400"
        />
      </div>
    </div>
  </CardHeader>
);

/**
 * ProductCard - Individual product display
 */
const ProductCard = ({ product, onClick }: { product: Product; onClick: () => void }) => {
  const isOutOfStock = product.stock <= 0;
  const [imgError, setImgError] = useState(false);
  const imageUrl = getProductImageUrl(product.image);
  const showImage = imageUrl && !imgError;
  const sizeOptions = getProductSizeOptions(product);
  const showSizePrices = product.hasSizes && sizeOptions.length > 0;

  return (
    <div
      className={cn(
        "group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer active:scale-[0.98] h-full flex flex-col",
        isOutOfStock && "opacity-75 grayscale-[0.5]"
      )}
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="aspect-[4/3] w-full bg-slate-50 dark:bg-slate-950/30 p-1 flex items-center justify-center relative overflow-hidden shrink-0">
        {showImage ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 w-full h-full p-2 text-center">
            <Package className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
            <span className="text-sm font-black text-slate-700 dark:text-slate-200 leading-tight line-clamp-3">
              {product.name}
            </span>
          </div>
        )}

        {/* Availability Badge */}
        <div className="absolute top-1 left-1 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            isOutOfStock ? "bg-red-500" : "bg-green-500"
          )} />
          <span className="text-[7px] font-black text-slate-600 dark:text-slate-300 uppercase">
            {isOutOfStock ? 'نفذت' : `${product.stock}`}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-1 flex flex-col gap-1 flex-1 min-h-0">
        <h3 className="font-black text-slate-800 dark:text-slate-100 text-[11px] leading-snug truncate">
          {product.name}
        </h3>

        {showSizePrices ? (
          <div className={cn(
            "grid gap-0.5",
            sizeOptions.length === 1 && "grid-cols-1",
            sizeOptions.length === 2 && "grid-cols-2",
            sizeOptions.length === 3 && "grid-cols-3",
          )}>
            {sizeOptions.map((size) => (
              <div key={size.key} className="flex flex-col items-center min-w-0 bg-slate-50 dark:bg-slate-950/50 py-0.5 rounded-md">
                <span className="text-[7px] font-black text-slate-400 uppercase">
                  {size.key === "s" ? "ص" : size.key === "m" ? "و" : "ك"}
                </span>
                <span className="text-[8px] font-black text-slate-800 dark:text-white tabular-nums truncate w-full text-center">
                  {size.price}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-blue-600/5 py-1 rounded-md flex items-center justify-center border border-blue-600/5 mt-auto">
            <span className="text-blue-600 dark:text-blue-400 font-black text-[10px]">
              {product.price} <small className="text-[8px]">ج</small>
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
  <CardFooter className="py-1.5 px-3 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center shrink-0 bg-slate-50 dark:bg-slate-950">
    <Button
      variant="outline"
      size="icon"
      data-compact
      className="h-7 w-7 rounded-md bg-white dark:bg-slate-900 border-none shadow-sm hover:shadow-md active:scale-90 transition-all text-slate-400 hover:text-blue-600 disabled:opacity-20"
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
    >
      <ChevronRight className="h-4 w-4" />
    </Button>

    <div className="flex flex-col items-center gap-0.5">
      <div className="h-1 w-16 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${(currentPage / (totalPages || 1)) * 100}%` }}
        />
      </div>
      <span className="text-[7px] font-black text-slate-500 tracking-widest uppercase">
        {currentPage} / {totalPages || 1}
      </span>
    </div>

    <Button
      variant="outline"
      size="icon"
      data-compact
      className="h-7 w-7 rounded-md bg-white dark:bg-slate-900 border-none shadow-sm hover:shadow-md active:scale-90 transition-all text-slate-400 hover:text-blue-600 disabled:opacity-20"
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages || totalPages === 0}
    >
      <ChevronLeft className="h-4 w-4" />
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
}: ProductGridProps) => {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg isolate">
      <ProductGridHeader searchTerm={searchTerm} handleSearchChange={handleSearchChange} />

      <CardContent className="flex-1 overflow-hidden p-1.5 relative z-10 min-h-0">
        {paginatedProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-2xl mb-3">
              <Package className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm font-black text-slate-400 dark:text-slate-500">
              لا توجد منتجات
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-2 h-full content-start">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product)}
              />
            ))}
          </div>
        )}
      </CardContent>

      <PaginationFooter
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};
