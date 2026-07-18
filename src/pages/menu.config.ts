import {
  ShoppingCart,
  Package,
  FileText,
  BarChart3,
  Receipt,
  Users,
  Clock,
  UserRound,
} from "lucide-react";
import type { UserRole } from "@/types/auth";

export interface MenuItem {
  value: string;
  label: string;
  icon: typeof ShoppingCart;
  roles?: UserRole[];
}

export const MENU_ITEMS: MenuItem[] = [
  { value: "sales", label: "نقطة البيع", icon: ShoppingCart },
  { value: "products", label: "المنتجات", icon: Package, roles: ["admin", "manager"] },
  { value: "sales-invoices", label: "فواتير المبيعات", icon: Receipt },
  { value: "customers", label: "العملاء", icon: UserRound },
  { value: "invoices", label: "فواتير الشراء", icon: FileText, roles: ["admin", "manager"] },
  { value: "employees", label: "الموظفين", icon: Users, roles: ["admin"] },
  { value: "shifts", label: "الورديات", icon: Clock, roles: ["admin", "manager"] },
  { value: "reports", label: "التقارير", icon: BarChart3, roles: ["admin", "manager"] },
];

export function getMenuItemsForRole(role?: UserRole | null) {
  if (!role) return MENU_ITEMS;
  return MENU_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}
