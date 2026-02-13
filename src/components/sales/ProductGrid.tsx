import { Search, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/constants";

interface ProductGridProps {
  searchTerm: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  paginatedProducts: any[];
  handleProductClick: (product: any) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

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
    <div className="flex-1 flex flex-col bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-2xl lg:rounded-[2.5rem] overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600/5 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      
      <CardHeader className="py-3 lg:py-5 px-3 lg:px-8 shrink-0 relative z-10 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 lg:gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-blue-600/10 p-2 rounded-xl">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-base lg:text-xl font-black text-slate-800 dark:text-white">المنتجات</CardTitle>
          </div>
          
          <div className="relative w-full md:w-72 group">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="بحث..."
              className="h-10 lg:h-11 pr-10 bg-slate-50 dark:bg-slate-950 border-none rounded-xl lg:rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-500/20 font-bold transition-all w-full text-sm"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-2 lg:p-6 relative z-10 scrollbar-hide">
        {paginatedProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale min-h-[200px]">
            <Package className="w-16 h-16 lg:w-20 lg:h-20 mb-4" />
            <p className="text-lg lg:text-xl font-black">لا توجد منتجات</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 lg:gap-6">
            {paginatedProducts.map((product) => (
              <div
                key={product.id}
                className="group relative bg-white dark:bg-slate-800 border-none rounded-xl lg:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer active:scale-[0.98]"
                onClick={() => handleProductClick(product)}
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors duration-500" />
                
                {/* Image Holder */}
                <div className="aspect-[4/3] w-full bg-slate-50 dark:bg-slate-950 p-2 lg:p-6 flex items-center justify-center group-hover:p-4 transition-all duration-500">
                  {product.image ? (
                    <img
                      src={"https://greensolar-power.com/POS-API/" + product.image}
                      alt={product.name}
                      className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <Package className="w-8 h-8 lg:w-12 lg:h-12 text-slate-200 dark:text-slate-800" />
                  )}
                </div>

                {/* Content */}
                <div className="p-2 lg:p-5 flex flex-col gap-1.5 lg:gap-4">
                  <div className="space-y-0.5 lg:space-y-1">
                    <h3 className="font-black text-slate-700 dark:text-slate-100 text-xs lg:text-sm leading-tight group-hover:text-blue-600 transition-colors truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 lg:gap-2">
                      <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${product.stock > 0 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,44,44,0.5)]'}`} />
                      <span className="text-[8px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {product.stock > 0 ? `متاح: ${product.stock}` : 'نفذ الكمية'}
                      </span>
                    </div>
                  </div>

                  {product.hasSizes ? (
                    <div className="grid grid-cols-3 gap-1 lg:gap-2">
                      {/* S */}
                      <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-950/50 py-1 lg:py-2 rounded-md lg:rounded-xl group/size hover:bg-blue-600 transition-colors duration-300">
                        <span className="text-[8px] lg:text-[9px] font-black text-slate-400 group-hover/size:text-blue-100 uppercase mb-0.5">ص</span>
                        <span className="text-[9px] lg:text-xs font-black text-slate-800 dark:text-white group-hover/size:text-white">{product.s_price}</span>
                      </div>
                      {/* M */}
                      <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-950/50 py-1 lg:py-2 rounded-md lg:rounded-xl group/size hover:bg-purple-600 transition-colors duration-300">
                        <span className="text-[8px] lg:text-[9px] font-black text-slate-400 group-hover/size:text-purple-100 uppercase mb-0.5">و</span>
                        <span className="text-[9px] lg:text-xs font-black text-slate-800 dark:text-white group-hover/size:text-white">{product.m_price}</span>
                      </div>
                      {/* L */}
                      <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-950/50 py-1 lg:py-2 rounded-md lg:rounded-xl group/size hover:bg-emerald-600 transition-colors duration-300">
                        <span className="text-[8px] lg:text-[9px] font-black text-slate-400 group-hover/size:text-emerald-100 uppercase mb-0.5">ك</span>
                        <span className="text-[9px] lg:text-xs font-black text-slate-800 dark:text-white group-hover/size:text-white">{product.l_price}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-600/10 py-1.5 lg:py-3 rounded-lg lg:rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-all duration-300">
                      <span className="text-blue-700 dark:text-blue-400 font-black text-xs lg:text-sm group-hover:text-white">
                        {product.price} ج
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Premium Pagination Footer */}
      <CardFooter className="py-2 lg:py-5 px-4 lg:px-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0 bg-slate-50/50 dark:bg-slate-950/50 relative z-10">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-md hover:shadow-lg active:scale-90 transition-all text-slate-400 disabled:opacity-30"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-4">
          <div className="h-1 w-24 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500" 
              style={{ width: `${(currentPage / (totalPages || 1)) * 100}%` }}
            />
          </div>
          <span className="text-xs font-black text-slate-500">
            {currentPage} / {totalPages || 1}
          </span>
        </div>

        <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-md hover:shadow-lg active:scale-90 transition-all text-slate-400 disabled:opacity-30"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </CardFooter>
    </div>
  );
};
