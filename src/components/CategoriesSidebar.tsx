import { Button } from "@/components/ui/button";
import { useMemo, useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useCategoryItemsPerPage } from "@/hooks/useCategoryItemsPerPage";

export default function CategoriesSidebar({
    categories,
    selectedCategory,
    setSelectedCategory
}: any) {
    const asideRef = useRef<HTMLElement>(null);
    const itemsPerPage = useCategoryItemsPerPage(asideRef);
    const [page, setPage] = useState(0);

    const totalPages = Math.max(1, Math.ceil(categories.length / itemsPerPage));

    const visibleCategories = useMemo(() => {
        const start = page * itemsPerPage;
        return categories.slice(start, start + itemsPerPage);
    }, [categories, page, itemsPerPage]);

    useEffect(() => {
        if (page >= totalPages) {
            setPage(Math.max(0, totalPages - 1));
        }
    }, [page, totalPages]);

    return (
        <aside
            ref={asideRef}
            className="
                w-full h-full
                bg-slate-100 dark:bg-slate-900 
                border border-slate-300 dark:border-slate-800 
                rounded-xl 
                p-2 
                flex lg:flex-col items-center lg:items-stretch gap-1.5 
                shadow-lg 
                overflow-x-auto lg:overflow-hidden
                scrollbar-hide
            "
            dir="rtl"
        >
            <div className="hidden lg:flex items-center gap-2 px-2 shrink-0">
                <div className="w-1 h-4 bg-blue-600 rounded-full" />
                <span className="text-base font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">الأقسام</span>
            </div>

            <Button
                className={`
                    h-10 w-auto px-3 whitespace-nowrap lg:h-10 lg:w-full lg:whitespace-normal
                    text-base font-black rounded-xl touch-manipulation active:scale-95 transition-all duration-300 relative overflow-hidden group shrink-0
                    ${selectedCategory === null
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                        : "bg-slate-200 dark:bg-slate-950 text-slate-800 dark:text-slate-300 border-none hover:bg-slate-50 dark:hover:bg-slate-900"
                    }
                `}
                variant={selectedCategory === null ? "default" : "ghost"}
                onClick={() => setSelectedCategory(null)}
            >
                <span className="relative z-10">الكل</span>
            </Button>

            <div className="flex lg:flex-col gap-1.5 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
                <div className="flex lg:hidden gap-1.5">
                    {categories.map((cat: any) => (
                        <CategoryButton
                            key={cat.id}
                            cat={cat}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                        />
                    ))}
                </div>

                <div className="hidden lg:flex lg:flex-col gap-1.5 flex-1 min-h-0">
                    {visibleCategories.map((cat: any) => (
                        <CategoryButton
                            key={cat.id}
                            cat={cat}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                        />
                    ))}
                </div>
            </div>

            {totalPages > 1 && (
                <div className="hidden lg:flex justify-between items-center px-1 shrink-0 gap-1">
                    <Button
                        variant="default"
                        size="icon"
                        disabled={page === 0}
                        onClick={() => setPage(p => p - 1)}
                        className="h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white border-2 border-blue-700 shadow-md disabled:opacity-40"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>

                    <span className="text-base font-black text-slate-700 dark:text-slate-300">
                        {page + 1} / {totalPages}
                    </span>

                    <Button
                        variant="default"
                        size="icon"
                        disabled={page === totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                        className="h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white border-2 border-blue-700 shadow-md disabled:opacity-40"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </div>
            )}
        </aside>
    );
}

function CategoryButton({ cat, selectedCategory, setSelectedCategory }: any) {
    return (
        <Button
            onClick={() => setSelectedCategory(cat.id)}
            className={`
                h-10
                text-base font-black rounded-xl 
                justify-start gap-2 px-3 
                touch-manipulation active:scale-95 transition-all duration-300 relative overflow-hidden border-none 
                shrink-0 whitespace-nowrap
                ${selectedCategory === cat.id
                    ? "text-white shadow-lg"
                    : "bg-slate-200 dark:bg-slate-950 text-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                }
            `}
            style={{
                backgroundColor: selectedCategory === cat.id ? cat.color : undefined,
                boxShadow: selectedCategory === cat.id ? `${cat.color}40 0px 6px 12px` : undefined
            }}
            variant="ghost"
        >
            <div className="relative w-2.5 h-2.5 shrink-0 flex items-center justify-center">
                <div
                    className={`w-full h-full rounded-full ${selectedCategory === cat.id ? 'scale-125' : ''}`}
                    style={{ backgroundColor: selectedCategory === cat.id ? '#fff' : cat.color }}
                />
            </div>
            <span className="truncate relative z-10">{cat.name}</span>
        </Button>
    );
}
