import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number | ((prev: number) => number)) => void;
}

const ProductPagination = ({
  currentPage,
  totalPages,
  onPageChange
}: ProductPaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 pt-6">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => onPageChange(p => p - 1)}
        className="dark:border-slate-700 dark:text-slate-300"
      >
        <ChevronRight className="w-5 h-5 ml-1" /> السابق
      </Button>
      <span className="text-sm font-bold dark:text-slate-400">
        صفحة {currentPage} من {totalPages}
      </span>
      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(p => p + 1)}
        className="dark:border-slate-700 dark:text-slate-300"
      >
        التالي <ChevronLeft className="w-5 h-5 mr-1" />
      </Button>
    </div>
  );
};

export default ProductPagination;
