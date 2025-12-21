// menu.config.ts
import {
    ShoppingCart,
    Package,
    FileText,
    BarChart3,
    Receipt,
    Users
} from "lucide-react";

export const MENU_ITEMS = [
    { value: "sales", label: "نقطة البيع", icon: ShoppingCart },
    { value: "products", label: "المنتجات", icon: Package },
    { value: "sales-invoices", label: "فواتير المبيعات", icon: Receipt },
    { value: "invoices", label: "فواتير الشراء", icon: FileText },
    { value: "employees", label: "الموظفين", icon: Users },
    { value: "reports", label: "التقارير", icon: BarChart3 },
];
