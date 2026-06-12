import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Employee } from "@/hooks/useSalesData";

interface CheckoutDialogProps {
  showEmployeeDialog: boolean;
  setShowEmployeeDialog: (open: boolean) => void;
  selectedEmployee: string;
  setSelectedEmployee: (value: string) => void;
  employees: Employee[];
  kitchenNote: string;
  setKitchenNote: (value: string) => void;
  handleCheckout: () => void;
}

export const CheckoutDialog = ({
  showEmployeeDialog,
  setShowEmployeeDialog,
  selectedEmployee,
  setSelectedEmployee,
  employees,
  kitchenNote,
  setKitchenNote,
  handleCheckout
}: CheckoutDialogProps) => {
  return (
    <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
      <DialogContent
        className="max-w-md overflow-hidden overflow-x-hidden rounded-2xl border-none bg-white dark:bg-slate-900 shadow-2xl p-0 gap-0"
        dir="rtl"
      >
        <div className="bg-slate-900 p-4 text-white">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-black tracking-tight">تأكيد العملية</DialogTitle>
            <p className="text-slate-400 font-bold text-xs mt-1">خطوات نهائية لإصدار الفاتورة</p>
          </DialogHeader>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">الموظف المسؤول</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-full h-11 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl px-4 text-sm font-black text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/20">
                <SelectValue placeholder="-- اختر الموظف --" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800 shadow-xl">
                {employees.map((emp) => (
                  <SelectItem
                    key={emp.id}
                    value={emp.id.toString()}
                    className="font-bold py-2 focus:bg-blue-600 focus:text-white rounded-lg"
                  >
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">ملاحظات التحضير</Label>
            <div className="relative">
              <Receipt className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="مثال: بدون سكر - زيادة ثلج..."
                value={kitchenNote}
                onChange={(e) => setKitchenNote(e.target.value)}
                className="h-11 pr-10 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-sm font-bold placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/20"
              />
            </div>
          </div>

          <Button
            data-compact
            onClick={handleCheckout}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 font-black text-white text-sm tracking-wide active:scale-95 transition-all"
          >
            إتمام البيع وطباعة الفاتورة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
