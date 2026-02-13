import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ProductFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ProductFilters = ({ searchTerm, setSearchTerm }: ProductFiltersProps) => {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
        <Search className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
      </div>
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-12 w-full pr-12 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 rounded-2xl dark:text-white font-bold transition-all placeholder:text-slate-400 placeholder:font-medium"
        placeholder="ابحث باسم المنتج، الفئة، أو الباركود..."
      />
      {searchTerm && (
        <button 
          onClick={() => setSearchTerm("")}
          className="absolute inset-y-0 left-3 flex items-center p-1 text-slate-400 hover:text-red-500 transition-colors"
        >
          <span className="text-[10px] font-black underline underline-offset-4">مسح</span>
        </button>
      )}
    </div>
  );
};

export default ProductFilters;
