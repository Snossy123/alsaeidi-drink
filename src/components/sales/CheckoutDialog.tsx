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
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-2xl" dir="rtl">
        <div className="bg-slate-900 p-8 text-white relative">
          <div className="absolute top-0 left-0 w-32 h-32 bg-purple-600/30 blur-[80px] rounded-full -translate-x-1/2 -translate-y-1/2" />
          <DialogHeader className="relative z-10 text-right">
            <DialogTitle className="text-3xl font-black tracking-tight">تأكيد العملية</DialogTitle>
            <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest">خطوات نهائية لإصدار الفاتورة</p>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-3">
            <Label className="text-sm font-black text-slate-500 uppercase tracking-widest mr-2">الموظف المسؤول</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-full h-16 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl p-5 text-lg font-black text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all">
                <SelectValue placeholder="-- اختر الموظف --" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl">
                {employees.map((emp) => (
                  <SelectItem 
                    key={emp.id} 
                    value={emp.id.toString()} 
                    className="font-bold py-3 focus:bg-blue-600 focus:text-white rounded-xl"
                  >
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-black text-slate-500 uppercase tracking-widest mr-2">ملاحظات التحضير</Label>
            <div className="relative group">
              <Receipt className="absolute right-5 top-5 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                type="text"
                placeholder="مثال: بدون سكر - زيادة ثلج..."
                value={kitchenNote}
                onChange={(e) => setKitchenNote(e.target.value)}
                className="h-16 pr-14 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-lg font-bold placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <Button 
            onClick={handleCheckout} 
            className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/20 font-black text-white text-xl tracking-wide active:scale-95 transition-all"
          >
            إتمام البيع وطباعة الفاتورة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
