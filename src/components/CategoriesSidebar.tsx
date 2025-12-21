import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

const ITEMS_PER_PAGE = 6;

export default function CategoriesSidebar({
    categories,
    selectedCategory,
    setSelectedCategory
}: any) {
    const [page, setPage] = useState(0);

    const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);

    const visibleCategories = useMemo(() => {
        const start = page * ITEMS_PER_PAGE;
        return categories.slice(start, start + ITEMS_PER_PAGE);
    }, [categories, page]);

    return (
        <aside className="w-48 bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-3xl p-3 flex flex-col gap-2 shadow-lg h-fit">

            {/* "All" Button - Adjusted for Dark Mode */}
            <Button
                className={`h-12 text-base font-bold rounded-xl touch-manipulation active:scale-95 transition-all ${selectedCategory === null
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-transparent text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
            >
                الكل
            </Button>

            {visibleCategories.map((cat: any) => (
                <Button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="h-12 text-sm font-bold rounded-xl justify-start gap-2 px-3 touch-manipulation active:scale-95 transition-all overflow-hidden border"
                    style={{
                        background: selectedCategory === cat.id ? cat.color : "transparent",
                        color: selectedCategory === cat.id ? "#fff" : cat.color,
                        borderColor: cat.color,
                        // إضافة تعتيم طفيف للحدود في الوضع الداكن إذا لم يكن مختاراً
                        opacity: selectedCategory !== null && selectedCategory !== cat.id ? 0.6 : 1
                    }}
                    variant="outline"
                >
                    <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate">{cat.name}</span>
                </Button>
            ))}

            {/* Compact Pagination - Dark Mode Fixed */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-2 px-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={page === 0}
                        onClick={() => setPage(p => p - 1)}
                        className="h-9 w-9 rounded-full border border-gray-100 dark:border-slate-800 dark:text-slate-400 shadow-sm disabled:opacity-30"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>

                    <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                        {page + 1} / {totalPages}
                    </span>

                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={page === totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                        className="h-9 w-9 rounded-full border border-gray-100 dark:border-slate-800 dark:text-slate-400 shadow-sm disabled:opacity-30"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </div>
            )}
        </aside>
    );
}