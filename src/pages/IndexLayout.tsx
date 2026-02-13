import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Calculator, Moon, Sun, LayoutDashboard, Settings, LogOut } from "lucide-react";

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
            className="h-12 w-12 rounded-2xl bg-primary text-white
                 flex items-center justify-center shadow-lg shadow-primary/20
                 touch-manipulation border border-white/10 active:scale-95 transition-all"
        >
            <Calculator className="w-6 h-6" />
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
        const components: Record<string, React.ReactNode> = {
            "sales": <SalesInterface />,
            "products": <ProductManagement />,
            "sales-invoices": <SalesInvoices />,
            "invoices": <PurchaseInvoices />,
            "employees": <Employees />,
            "reports": <ReportsSection />,
        };
        
        return components[activeTab] || <SalesInterface />;
    };

    return (
        <div
            {...swipeHandlers}
            dir="rtl"
            className="flex min-h-svh w-full mesh-bg overflow-hidden"
        >
            {/* Sidebar */}
            <Sidebar
                side="right"
                collapsible="icon"
                className="glass border-l border-white/10 dark:border-white/5"
            >
                <SidebarHeader className="p-6 flex flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <CalculatorIconButton />
                        <div className="group-data-[collapsible=icon]:hidden">
                            <h2 className="text-lg font-display font-black tracking-tighter">سنسو POS</h2>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Smart Operations</p>
                        </div>
                    </div>
                </SidebarHeader>

                <SidebarContent className="p-4">
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-4 group-data-[collapsible=icon]:hidden">
                            القائمة الرئيسية
                        </SidebarGroupLabel>

                        <SidebarGroupContent>
                            <SidebarMenu className="gap-3">
                                {MENU_ITEMS.map(({ value, label, icon: Icon }) => (
                                    <SidebarMenuItem key={value}>
                                        <SidebarMenuButton
                                            size="lg"
                                            isActive={activeTab === value}
                                            onClick={() => setActiveTab(value)}
                                            className="
                        h-14 text-base font-bold gap-4 rounded-2xl
                        transition-all duration-300
                        hover:bg-primary/10 hover:text-primary
                        data-[active=true]:bg-primary
                        data-[active=true]:text-white
                        data-[active=true]:shadow-xl
                        data-[active=true]:shadow-primary/30
                        data-[active=true]:scale-[1.02]
                      "
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span>{label}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <div className="mt-auto p-4 border-t border-white/5 space-y-2">
                    <button
                        onClick={toggle}
                        className="w-full h-12 rounded-xl flex items-center justify-center gap-3 text-muted-foreground hover:bg-white/5 transition-colors group-data-[collapsible=icon]:p-0"
                    >
                        {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        <span className="group-data-[collapsible=icon]:hidden font-bold text-sm">{dark ? "الوضع النهاري" : "الوضع الليلي"}</span>
                    </button>
                    <button className="w-full h-12 rounded-xl flex items-center justify-center gap-3 text-red-500 hover:bg-red-500/10 transition-colors group-data-[collapsible=icon]:p-0">
                        <LogOut className="w-5 h-5" />
                        <span className="group-data-[collapsible=icon]:hidden font-bold text-sm">تسجيل الخروج</span>
                    </button>
                </div>

                <SidebarRail />
            </Sidebar>

            {/* Main */}
            <SidebarInset className="bg-transparent">
                <main className="h-full overflow-auto p-0 md:p-6 lg:p-10 relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="relative z-10 h-full">
                        {renderContent()}
                    </div>
                </main>
            </SidebarInset>
        </div>
    );
}
