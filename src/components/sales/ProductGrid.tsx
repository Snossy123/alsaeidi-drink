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
  <CardHeader className="py-2 px-3 shrink-0 border-b border-slate-300 dark:border-slate-800/50">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600/10 p-1.5 rounded-lg">
          <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
          المنتجات
        </CardTitle>
      </div>

      <div className="relative w-full sm:w-56 group">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-all" />
        <Input
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="ابحث..."
          className="h-10 pr-9 bg-slate-200 dark:bg-slate-950 border-slate-300 dark:border-slate-800 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/20 font-bold w-full text-base placeholder:text-slate-500"
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
      className="group relative bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800/40 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer active:scale-[0.98] h-full flex flex-col"
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="aspect-[4/3] w-full min-h-0 flex-1 bg-slate-200/60 dark:bg-slate-950/30 p-1 flex items-center justify-center relative overflow-hidden">
        {showImage ? (
          <>
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-x-0 bottom-0 z-10 bg-black/80 pt-2 pb-2 px-2 pointer-events-none">
              <span className="block text-right text-white font-black text-base leading-snug line-clamp-2">
                {product.name}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 w-full h-full p-2 text-center">
            <Package className="w-5 h-5 text-slate-400 dark:text-slate-600 shrink-0" />
            <span className="text-base font-black text-slate-800 dark:text-slate-200 leading-tight line-clamp-3">
              {product.name}
            </span>
          </div>
        )}

        {/* Availability Badge */}
        <div className="absolute top-1 left-1 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 shadow-sm border border-slate-300 dark:border-slate-800">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            isOutOfStock ? "bg-red-500" : "bg-green-500"
          )} />
          <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">
            {isOutOfStock ? 'نفذت' : `${product.stock}`}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-1.5 flex flex-col gap-1 shrink-0">
        {showSizePrices ? (
          <div className={cn(
            "grid gap-0.5",
            sizeOptions.length === 1 && "grid-cols-1",
            sizeOptions.length === 2 && "grid-cols-2",
            sizeOptions.length === 3 && "grid-cols-3",
          )}>
            {sizeOptions.map((size) => (
              <div key={size.key} className="flex flex-col items-center min-w-0 bg-slate-200/80 dark:bg-slate-950/50 py-1 rounded-md">
                <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase">
                  {size.key === "s" ? "ص" : size.key === "m" ? "و" : "ك"}
                </span>
                <span className="text-sm font-black text-slate-800 dark:text-white tabular-nums truncate w-full text-center">
                  {size.price}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-blue-600/10 py-1.5 rounded-md flex items-center justify-center border border-blue-600/15 mt-auto">
            <span className="text-blue-700 dark:text-blue-400 font-black text-base">
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
}: ProductGridProps) => {
  return (
    <div className="h-full flex flex-col bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg isolate">
      <ProductGridHeader searchTerm={searchTerm} handleSearchChange={handleSearchChange} />

      <CardContent className="flex-1 overflow-hidden p-1.5 relative z-10 min-h-0">
        {paginatedProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="bg-slate-200 dark:bg-slate-800/50 p-4 rounded-2xl mb-3">
              <Package className="w-10 h-10 text-slate-400 dark:text-slate-600" />
            </div>
            <p className="text-base font-black text-slate-600 dark:text-slate-500">
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
