import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Package } from "lucide-react";
import { Product, Category } from "@/types";

interface ProductCardProps {
  product: Product;
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  getCategoryColor: (categoryId: any) => string;
}

const ProductCard = ({
  product,
  categories,
  onEdit,
  onDelete,
  getCategoryColor
}: ProductCardProps) => {
  const categoryName = categories.find(c => Number(c.id) === product.category_id)?.name || "بدون فئة";
  const categoryColor = getCategoryColor(product.category_id);

  return (
    <Card className="group relative bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden rounded-2xl">
      {/* Product Image */}
      <div className="aspect-[4/3] w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center border-b dark:border-slate-800 p-4 relative group-hover:bg-blue-50/10 transition-colors">
        {product.image ? (
          <img
            src={"https://greensolar-power.com/POS-API/" + product.image}
            alt={product.name}
            className="w-full h-full object-contain drop-shadow-xl"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-300 dark:text-slate-700">
            <Package className="w-10 h-10 opacity-20" />
            <span className="text-[10px] font-bold tracking-widest opacity-30">NO PREVIEW</span>
          </div>
        )}
        
        {/* Category Badge - Glassmorphism style */}
        <div className="absolute top-3 right-3">
          <Badge
            variant="secondary"
            className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-none shadow-sm text-[10px] font-black px-2.5 py-1"
            style={{ color: categoryColor }}
          >
            {categoryName}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-lg font-black text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 transition-colors">
          {product.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 pb-5 px-5">
        {product.hasSizes ? (
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: "ص", v: product.s_price, c: "from-blue-500 to-blue-600" },
              { l: "و", v: product.m_price, c: "from-indigo-500 to-indigo-600" },
              { l: "ك", v: product.l_price, c: "from-violet-500 to-violet-600" }
            ].map((s, i) => (
              <div key={i} className="text-center bg-slate-50/50 dark:bg-slate-800/30 p-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 mb-0.5">{s.l}</p>
                <p className={`text-sm font-black bg-clip-text text-transparent bg-gradient-to-br ${s.c}`}>
                  {Number(s.v).toFixed(1)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-3 rounded-2xl text-center shadow-lg shadow-blue-500/20">
            <div className="text-[10px] text-white/70 font-bold mb-1">السعر الحالي</div>
            <span className="text-xl font-black text-white">
              {Number(product.price).toFixed(2)} <span className="text-xs opacity-80">ج.م</span>
            </span>
          </div>
        )}

        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${product.stock < 5 ? 'animate-pulse bg-red-500' : 'bg-green-500'}`} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">الحالة بالمخزون</span>
          </div>
          <span className={`text-sm font-black ${product.stock < 5 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
            {product.stock} <span className="text-[10px] opacity-50">قطعة</span>
          </span>
        </div>

        <div className="flex gap-2 pt-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <Button
            variant="default"
            size="sm"
            onClick={() => onEdit(product)}
            className="flex-1 h-10 bg-slate-900 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 text-white rounded-xl shadow-md transition-all"
          >
            <Edit className="w-4 h-4 ml-2" /> تعديل
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(product.id)}
            className="h-10 w-12 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/30 rounded-xl"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
