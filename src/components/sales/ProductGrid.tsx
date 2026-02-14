import { Search, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/constants";

// Derive image base URL from API_BASE_URL (removing /public/api)
const IMAGE_BASE_URL = API_BASE_URL.replace("/public/api", "");

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
  <CardHeader className="py-3 lg:py-6 px-3 lg:px-8 shrink-0 relative z-10 border-b border-slate-100 dark:border-slate-800/50">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 lg:gap-4">
      <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="bg-blue-600/10 p-2 rounded-xl transition-transform hover:scale-110">
            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-base lg:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            المنتجات
          </CardTitle>
        </div>
      </div>
      
      <div className="relative w-full sm:w-64 md:w-80 group">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-all duration-300" />
        <Input
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="ابحث..."
          className="h-9 lg:h-12 pr-9 bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-lg lg:rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-500/20 font-bold transition-all w-full text-xs lg:text-sm placeholder:text-slate-400 shadow-sm"
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
  
  return (
    <div
      className={cn(
        "group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40 rounded-lg lg:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-500 cursor-pointer active:scale-[0.98]",
        isOutOfStock && "opacity-75 grayscale-[0.5]"
      )}
      onClick={onClick}
    >
      {/* Background Decorative Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-500" />
      
      {/* Image Section */}
      <div className="aspect-[1/1] w-full bg-slate-50/50 dark:bg-slate-950/30 p-1.5 lg:p-4 flex items-center justify-center relative overflow-hidden">
        {product.image ? (
          <img
            src={IMAGE_BASE_URL + "/" + product.image}
            alt={product.name}
            className="w-full h-full object-contain drop-shadow-md lg:drop-shadow-xl transition-all duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="bg-slate-100 dark:bg-slate-800/50 p-3 lg:p-5 rounded-xl lg:rounded-2xl">
            <Package className="w-6 h-6 lg:w-10 lg:h-10 text-slate-300 dark:text-slate-700" />
          </div>
        )}
        
        {/* Availability Badge */}
        <div className="absolute top-1.5 left-1.5 lg:top-3 lg:left-3 flex items-center gap-1 px-1 py-0.5 lg:px-2 lg:py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm border border-slate-100/50 dark:border-slate-800/50">
          <div className={cn(
            "w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full animate-pulse",
            isOutOfStock ? "bg-red-500 shadow-[0_0_8px_rgba(239,44,44,0.5)]" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
          )} />
          <span className="text-[7px] lg:text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">
            {isOutOfStock ? 'نفذت' : `${product.stock}`}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-1.5 lg:p-4 flex flex-col gap-1.5 lg:gap-3 relative z-10">
        <h3 className="font-black text-slate-800 dark:text-slate-100 text-xs lg:text-sm leading-snug group-hover:text-blue-600 transition-colors truncate">
          {product.name}
        </h3>

        {product.hasSizes ? (
          <div className="grid grid-cols-3 gap-0.5 lg:gap-2">
            {[
              { label: 'ص', price: product.s_price, color: 'hover:bg-blue-600' },
              { label: 'و', price: product.m_price, color: 'hover:bg-purple-600' },
              { label: 'ك', price: product.l_price, color: 'hover:bg-emerald-600' }
            ].map((size, idx) => (
              <div key={idx} className={cn(
                "flex flex-col items-center bg-slate-50 dark:bg-slate-950/50 py-1 lg:py-2 rounded-md lg:rounded-xl group/size transition-all duration-300 border border-transparent hover:border-white/20",
                size.color
              )}>
                <span className="text-[8px] lg:text-[10px] font-black text-slate-400 group-hover/size:text-white/80 uppercase mb-0">{size.label}</span>
                <span className="text-[9px] lg:text-xs font-black text-slate-800 dark:text-white group-hover/size:text-white">{size.price}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-blue-600/5 py-1.5 lg:py-3 rounded-md lg:rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:shadow-lg group-hover:shadow-blue-600/10 transition-all duration-300 border border-blue-600/5">
            <span className="text-blue-600 dark:text-blue-400 font-black text-xs lg:text-base group-hover:text-white">
              {product.price} <small className="text-[10px] lg:text-[12px]">ج</small>
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
  <CardFooter className="py-2 lg:py-4 px-3 lg:px-6 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center shrink-0 bg-slate-50/20 dark:bg-slate-950/20 backdrop-blur-sm relative z-10">
    <Button
      variant="outline"
      size="icon"
      className="h-7 w-7 lg:h-10 lg:w-10 rounded-md lg:rounded-xl bg-white dark:bg-slate-900 border-none shadow-sm hover:shadow-xl active:scale-90 transition-all text-slate-400 hover:text-blue-600 disabled:opacity-20"
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
    >
      <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5" />
    </Button>

    <div className="flex flex-col items-center gap-1">
      <div className="h-1 lg:h-1.5 w-12 lg:w-32 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)] transition-all duration-700 ease-out" 
          style={{ width: `${(currentPage / (totalPages || 1)) * 100}%` }}
        />
      </div>
      <span className="text-[7px] lg:text-[10px] font-black text-slate-500 tracking-widest uppercase">
        {currentPage} / {totalPages || 1}
      </span>
    </div>

    <Button
      variant="outline"
      size="icon"
      className="h-7 w-7 lg:h-10 lg:w-10 rounded-md lg:rounded-xl bg-white dark:bg-slate-900 border-none shadow-sm hover:shadow-xl active:scale-90 transition-all text-slate-400 hover:text-blue-600 disabled:opacity-20"
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages || totalPages === 0}
    >
      <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" />
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
    <div className="flex-1 flex flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/40 rounded-xl lg:rounded-[2.5rem] overflow-hidden shadow-2xl relative">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-blue-600/5 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/5 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />
      
      <ProductGridHeader searchTerm={searchTerm} handleSearchChange={handleSearchChange} />

      <CardContent className="flex-1 overflow-y-auto p-1.5 lg:p-6 relative z-10 scrollbar-hide">
        {paginatedProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center min-h-[250px] animate-in fade-in zoom-in duration-500">
            <div className="bg-slate-100 dark:bg-slate-800/50 p-4 lg:p-6 rounded-3xl mb-3 lg:mb-5">
              <Package className="w-10 h-10 lg:w-20 lg:h-20 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm lg:text-xl font-black text-slate-400 dark:text-slate-500">
              لا توجد منتجات
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-5">
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



