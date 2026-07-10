import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { Moon, Sun, LogOut } from "lucide-react";

import SalesInterface from "@/components/SalesInterface";
import ProductManagement from "@/components/ProductManagement";
import PurchaseInvoices from "@/components/PurchaseInvoices";
import ReportsSection from "@/components/ReportsSection";
import SalesInvoices from "@/components/SalesInvoices";
import Employees from "@/components/Employees";
import ShiftReport from "@/components/shifts/ShiftReport";
import { OfflineBanner } from "@/components/OfflineBanner";
import { SystemLogo } from "@/components/SystemLogo";
import { getMenuItemsForRole } from "./menu.config";
import { useAuth } from "@/contexts/AuthContext";
import { InvoiceEditProvider } from "@/contexts/InvoiceEditContext";

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
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";

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

const SidebarLogoButton = () => {
    const { toggleSidebar } = useSidebar();

    return (
        <button
            onClick={toggleSidebar}
            className="h-10 w-10 rounded-xl bg-white flex items-center justify-center touch-manipulation
                 active:scale-95 transition-all mx-auto overflow-hidden shrink-0"
            aria-label="فتح وإغلاق القائمة"
        >
            <SystemLogo variant="icon" className="h-10 w-10 rounded-xl" imageClassName="h-9 w-9" />
        </button>
    );
};

export function IndexLayout() {
    const [activeTab, setActiveTab] = useState("sales");
    const { dark, toggle } = useDarkMode();
    const { toggleSidebar } = useSidebar();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const menuItems = getMenuItemsForRole(user?.role);

    const isSalesTab = activeTab === "sales";

    const swipeHandlers = useSwipeable({
        onSwipedLeft: isSalesTab ? undefined : toggleSidebar,
        onSwipedRight: isSalesTab ? undefined : toggleSidebar,
        trackTouch: true,
    });

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const renderContent = () => {
        const components: Record<string, React.ReactNode> = {
            "sales": <SalesInterface
                activeTab={activeTab}
                onNavigate={setActiveTab}
                dark={dark}
                onToggleDark={toggle}
            />,
            "products": <ProductManagement />,
            "sales-invoices": <SalesInvoices onNavigate={setActiveTab} />,
            "invoices": <PurchaseInvoices />,
            "employees": <Employees />,
            "shifts": <ShiftReport />,
            "reports": <ReportsSection />,
        };

        return components[activeTab] || components.sales;
    };

    return (
        <InvoiceEditProvider>
        <div
            {...swipeHandlers}
            dir="rtl"
            className="flex h-svh w-full mesh-bg overflow-hidden"
        >
            {!isSalesTab && (
                <Sidebar
                    side="right"
                    collapsible="icon"
                    className="bg-sidebar border-l border-sidebar-border"
                >
                    <SidebarHeader className="p-2 group-data-[collapsible=icon]:p-2 flex flex-row items-center justify-center group-data-[collapsible=icon]:justify-center gap-3">
                        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
                            <SidebarLogoButton />
                            <div className="group-data-[collapsible=icon]:hidden min-w-0">
                                <SystemLogo />
                                {user && (
                                    <p className="text-[10px] text-muted-foreground mt-1">{user.name} — {user.role}</p>
                                )}
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent className="p-2 group-data-[collapsible=icon]:px-1">
                        <SidebarGroup>
                            <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-2 group-data-[collapsible=icon]:hidden">
                                القائمة الرئيسية
                            </SidebarGroupLabel>

                            <SidebarGroupContent>
                                <SidebarMenu className="gap-1.5">
                                    {menuItems.map(({ value, label, icon: Icon }) => (
                                        <SidebarMenuItem key={value}>
                                            <SidebarMenuButton
                                                size="lg"
                                                isActive={activeTab === value}
                                                onClick={() => setActiveTab(value)}
                                                tooltip={label}
                                                className="h-11 text-sm font-bold gap-3 rounded-xl transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!h-10 group-data-[collapsible=icon]:!w-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                                            >
                                                <Icon className="w-5 h-5 shrink-0" />
                                                <span className="group-data-[collapsible=icon]:hidden">{label}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <div className="mt-auto p-2 border-t border-sidebar-border space-y-1">
                        <button
                            onClick={toggle}
                            className="w-full h-10 rounded-xl flex items-center justify-center gap-3 text-muted-foreground hover:bg-sidebar-accent transition-colors group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:p-0"
                        >
                            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            <span className="group-data-[collapsible=icon]:hidden font-bold text-sm">{dark ? "الوضع النهاري" : "الوضع الليلي"}</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full h-10 rounded-xl flex items-center justify-center gap-3 text-red-500 hover:bg-red-500/10 transition-colors group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:p-0"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="group-data-[collapsible=icon]:hidden font-bold text-sm">تسجيل الخروج</span>
                        </button>
                    </div>

                    <SidebarRail />
                </Sidebar>
            )}

            <SidebarInset className="bg-transparent overflow-hidden w-full flex-1 h-svh min-h-0">
                <OfflineBanner />
                <main className={`h-full min-h-0 relative ${isSalesTab ? "overflow-hidden p-0" : "overflow-y-auto p-0 md:p-3 lg:p-4"}`}>
                    {!isSalesTab && (
                        <div className="lg:hidden sticky top-0 z-20 flex items-center gap-3 p-3 bg-background/80 backdrop-blur-md border-b border-border/50">
                            <SidebarTrigger className="h-10 w-10 shrink-0" />
                            <SystemLogo variant="compact" className="min-w-0" />
                        </div>
                    )}
                    {!isSalesTab && (
                        <div className="absolute top-0 right-0 w-[150px] h-[150px] lg:w-[400px] lg:h-[400px] bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    )}
                    <div className={`relative z-10 ${isSalesTab ? "h-full" : "h-full min-h-0 flex flex-col"}`}>
                        {renderContent()}
                    </div>
                </main>
            </SidebarInset>
        </div>
        </InvoiceEditProvider>
    );
}
