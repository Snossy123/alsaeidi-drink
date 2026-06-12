import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/apiClient";
import type { Shift } from "@/types/shift";
import { Clock, User } from "lucide-react";

const ShiftReport = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiClient<{ shifts: Shift[] }>("/shifts");
        setShifts(data.shifts || []);
      } catch (error) {
        console.error(error);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-blue-600/10">
          <Clock className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black">إدارة الورديات</h1>
          <p className="text-sm text-muted-foreground">سجل فتح وإغلاق الورديات</p>
        </div>
      </div>

      <div className="grid gap-4">
        {shifts.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">لا توجد ورديات</CardContent></Card>
        ) : (
          shifts.map((shift) => (
            <Card key={shift.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {shift.employee?.name || `موظف #${shift.employee_id}`}
                </CardTitle>
                <Badge variant={shift.status === "open" ? "default" : "secondary"}>
                  {shift.status === "open" ? "مفتوحة" : "مغلقة"}
                </Badge>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">الافتتاح</p>
                  <p className="font-bold">{new Date(shift.opened_at).toLocaleString("ar-EG")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">رصيد الافتتاح</p>
                  <p className="font-bold">{Number(shift.opening_float).toFixed(2)} ج</p>
                </div>
                {shift.closed_at && (
                  <div>
                    <p className="text-muted-foreground">الإغلاق</p>
                    <p className="font-bold">{new Date(shift.closed_at).toLocaleString("ar-EG")}</p>
                  </div>
                )}
                {shift.cash_difference != null && (
                  <div>
                    <p className="text-muted-foreground">فرق النقد</p>
                    <p className={`font-bold ${shift.cash_difference < 0 ? "text-red-500" : "text-green-600"}`}>
                      {Number(shift.cash_difference).toFixed(2)} ج
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ShiftReport;
