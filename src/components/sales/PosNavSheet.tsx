import { Moon, Sun, LogOut, Calculator } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MENU_ITEMS } from "@/pages/menu.config";

interface PosNavSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
  dark: boolean;
  onToggleDark: () => void;
}

export const PosNavSheet = ({
  open,
  onOpenChange,
  activeTab,
  onNavigate,
  dark,
  onToggleDark,
}: PosNavSheetProps) => {
  const handleNavigate = (tab: string) => {
    onNavigate(tab);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-72 p-0 flex flex-col" dir="rtl">
        <SheetHeader className="p-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div className="text-right">
              <SheetTitle className="text-base font-black">سنسو POS</SheetTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Smart Operations
              </p>
            </div>
          </div>
        </SheetHeader>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {MENU_ITEMS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleNavigate(value)}
              className={`w-full h-12 flex items-center gap-3 px-4 rounded-2xl text-sm font-bold transition-all ${
                activeTab === value
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border/50 space-y-2">
          <button
            onClick={onToggleDark}
            className="w-full h-11 rounded-xl flex items-center justify-center gap-3 text-muted-foreground hover:bg-muted transition-colors font-bold text-sm"
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{dark ? "الوضع النهاري" : "الوضع الليلي"}</span>
          </button>
          <button className="w-full h-11 rounded-xl flex items-center justify-center gap-3 text-red-500 hover:bg-red-500/10 transition-colors font-bold text-sm">
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
