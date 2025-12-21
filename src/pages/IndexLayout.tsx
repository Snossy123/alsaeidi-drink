import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Calculator, Moon, Sun } from "lucide-react";

import SalesInterface from "@/components/SalesInterface";
import ProductManagement from "@/components/ProductManagement";
import PurchaseInvoices from "@/components/PurchaseInvoices";
import ReportsSection from "@/components/ReportsSection";
import SalesInvoices from "@/components/SalesInvoices";
import Employees from "@/components/Employees";
import { MENU_ITEMS } from "./menu.config";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarInset,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar";

/* -------------------- Dark Mode Hook -------------------- */
const useDarkMode = () => {
    const [dark, setDark] = useState(
        localStorage.getItem("pos-theme") === "dark"
    );

    const toggle = () => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("pos-theme", next ? "dark" : "light");
    };

    return { dark, toggle };
};

/* -------------------- Calculator Button -------------------- */
const CalculatorIconButton = () => {
    const { toggleSidebar } = useSidebar();

    return (
        <button
            onClick={toggleSidebar}
            className="h-12 w-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600
                 flex items-center justify-center shadow-lg
                 touch-manipulation active:scale-95 transition"
        >
            <Calculator className="text-white w-6 h-6" />
        </button>
    );
};

/* -------------------- Main Layout -------------------- */
export function IndexLayout() {
    const [activeTab, setActiveTab] = useState("sales");
    const { dark, toggle } = useDarkMode();
    const { toggleSidebar } = useSidebar();

    const swipeHandlers = useSwipeable({
        onSwipedLeft: toggleSidebar,
        onSwipedRight: toggleSidebar,
        trackTouch: true,
    });

    const renderContent = () => {
        switch (activeTab) {
            case "sales": return <SalesInterface />;
            case "products": return <ProductManagement />;
            case "sales-invoices": return <SalesInvoices />;
            case "invoices": return <PurchaseInvoices />;
            case "employees": return <Employees />;
            case "reports": return <ReportsSection />;
            default: return <SalesInterface />;
        }
    };

    return (
        <div
            {...swipeHandlers}
            dir="rtl"
            className="flex min-h-svh w-full
                 bg-slate-50 dark:bg-slate-950
                 text-slate-900 dark:text-slate-100"
        >
            {/* Sidebar */}
            <Sidebar
                side="right"
                collapsible="icon"
                className="bg-white dark:bg-slate-900 border-l"
            >
                <SidebarHeader className="p-4 flex items-center gap-3">
                    <CalculatorIconButton />

                    <button
                        onClick={toggle}
                        className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800
                       flex items-center justify-center touch-manipulation"
                    >
                        {dark ? <Sun /> : <Moon />}
                    </button>
                </SidebarHeader>

                <SidebarContent className="p-3">
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-sm opacity-70">
                            القوائم
                        </SidebarGroupLabel>

                        <SidebarGroupContent>
                            <SidebarMenu className="gap-2">
                                {MENU_ITEMS.map(({ value, label, icon: Icon }) => (
                                    <SidebarMenuItem key={value}>
                                        <SidebarMenuButton
                                            size="lg"
                                            isActive={activeTab === value}
                                            onClick={() => setActiveTab(value)}
                                            className="
                        h-14 text-lg gap-3 rounded-2xl
                        touch-manipulation active:scale-95
                        data-[active=true]:bg-gradient-to-r
                        data-[active=true]:from-blue-600
                        data-[active=true]:to-purple-600
                        data-[active=true]:text-white
                      "
                                        >
                                            <Icon className="w-6 h-6" />
                                            <span>{label}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarRail />
            </Sidebar>

            {/* Main */}
            <SidebarInset className="flex-1 overflow-hidden">
                <main className="h-full overflow-auto p-6">
                    {renderContent()}
                </main>
            </SidebarInset>
        </div>
    );
}
