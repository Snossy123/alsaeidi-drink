import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

// Dynamically adjust items per page based on screen size could be complex, 
// but for simplicity, we'll keep pagination logic or just rely on scrolling for mobile.
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
        <aside 
            className="
                w-full lg:w-52 
                bg-white dark:bg-slate-900 
                border border-slate-100 dark:border-slate-800 
                rounded-[2rem] 
                p-2 lg:p-4 
                flex lg:flex-col items-center lg:items-stretch gap-2 lg:gap-3 
                shadow-xl lg:shadow-2xl 
                lg:h-fit lg:sticky lg:top-0 
                overflow-x-auto lg:overflow-visible
                scrollbar-hide
            " 
            dir="rtl"
        >
            <div className="hidden lg:flex items-center gap-2 px-2 mb-1">
                <div className="w-1 h-4 bg-blue-600 rounded-full" />
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">الأقسام</span>
            </div>

            {/* "All" Button */}
            <Button
                className={`
                    h-12 w-auto px-6 whitespace-nowrap lg:h-14 lg:w-full lg:whitespace-normal
                    text-sm font-black rounded-2xl touch-manipulation active:scale-95 transition-all duration-300 relative overflow-hidden group shrink-0
                    ${selectedCategory === null
                        ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                        : "bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-none hover:bg-white dark:hover:bg-slate-900 hover:shadow-lg"
                    }
                `}
                variant={selectedCategory === null ? "default" : "ghost"}
                onClick={() => setSelectedCategory(null)}
            >
                {selectedCategory === null && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent opacity-50 group-hover:translate-x-full transition-transform duration-500" />
                )}
                <span className="relative z-10">الكل</span>
            </Button>

            {/* Mobile Categories - Horizontal Scroll / Desktop Vertical Stack */}
            <div className="flex lg:flex-col gap-2.5">
                {/* On Mobile: Show ALL categories in horizontal scroll, easier than pagination */}
                {/* On Desktop: Use pagination if list is long, or just scroll if we prefer. 
                    Keeping pagination for desktop as requested originally, 
                    but adapting for mobile to just show them all in scroll. 
                */}
                
                {/* 
                   Strategy: 
                   Mobile -> Render ALL categories (horizontal scroll)
                   Desktop -> Render VISIBLE categories (pagination)
                */}
                
                <div className="flex lg:hidden gap-2">
                     {categories.map((cat: any) => (
                        <CategoryButton 
                            key={cat.id} 
                            cat={cat} 
                            selectedCategory={selectedCategory} 
                            setSelectedCategory={setSelectedCategory} 
                        />
                     ))}
                </div>

                <div className="hidden lg:flex lg:flex-col gap-2.5">
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

            {/* Compact Pagination - Desktop Only */}
            {totalPages > 1 && (
                <div className="hidden lg:flex justify-between items-center mt-2 px-1">
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

function CategoryButton({ cat, selectedCategory, setSelectedCategory }: any) {
    return (
        <Button
            onClick={() => setSelectedCategory(cat.id)}
            className={`
                h-12 lg:h-14 
                text-[13px] font-black rounded-2xl 
                justify-start gap-3 lg:gap-4 px-4 
                touch-manipulation active:scale-95 transition-all duration-300 relative overflow-hidden border-none group 
                shrink-0 whitespace-nowrap
                ${selectedCategory === cat.id
                    ? "text-white shadow-xl"
                    : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:shadow-lg"
                }
            `}
            style={{
                backgroundColor: selectedCategory === cat.id ? cat.color : undefined,
                boxShadow: selectedCategory === cat.id ? `${cat.color}40 0px 10px 20px` : undefined
            }}
            variant="ghost"
        >
            <div className="relative w-2.5 h-2.5 shrink-0 flex items-center justify-center">
                <div 
                    className={`w-full h-full rounded-full shadow-sm transition-transform duration-300 ${selectedCategory === cat.id ? 'scale-125' : 'scale-100'}`} 
                    style={{ backgroundColor: selectedCategory === cat.id ? '#fff' : cat.color }} 
                />
                {selectedCategory === cat.id && (
                    <div className="absolute inset-0 animate-ping opacity-40 bg-white rounded-full" />
                )}
            </div>
            <span className="truncate relative z-10">{cat.name}</span>
        </Button>
    )
}
