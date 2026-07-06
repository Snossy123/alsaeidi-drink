import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ProductFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ProductFilters = ({ searchTerm, setSearchTerm }: ProductFiltersProps) => {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
      </div>
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-10 w-full pr-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 rounded-xl dark:text-white text-sm font-bold transition-all placeholder:text-slate-400"
        placeholder="ابحث باسم المنتج، الفئة، أو الباركود..."
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
          className="absolute inset-y-0 left-3 flex items-center text-slate-400 hover:text-red-500 transition-colors text-xs font-bold"
        >
          مسح
        </button>
      )}
    </div>
  );
};

export default ProductFilters;
