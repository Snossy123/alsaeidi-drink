import { useState, useEffect, FormEvent } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { User, Plus, Briefcase, Calendar, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/constants";

const API_URL = API_BASE_URL + "/employees";

interface Employee {
  id: string;
  name: string;
  position: string;
  phone: string;
  salary: number;
  hire_date: string;
}

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [employeeData, setEmployeeData] = useState({
    name: "",
    position: "",
    phone: "",
    salary: "",
    hire_date: "",
  });

  const { toast } = useToast();

  // 🟦 Fetch all employees
  const fetchEmployees = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("فشل تحميل الموظفين");
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (err) {
      toast({
        title: "خطأ",
        description: "تعذر تحميل بيانات الموظفين",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // 🟩 Save new employee
  const saveEmployee = async (e: FormEvent) => {
    e.preventDefault();
    if (!employeeData.name || !employeeData.position || !employeeData.phone || !employeeData.salary || !employeeData.hire_date) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) throw new Error("فشل في حفظ الموظف");

      await fetchEmployees();
      setEmployeeData({ name: "", position: "", phone: "", salary: "", hire_date: "" });
      setIsDialogOpen(false);

      toast({
        title: "تم الحفظ بنجاح",
        description: `تمت إضافة الموظف ${employeeData.name}`,
      });
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل حفظ بيانات الموظف، حاول مرة أخرى",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <User className="w-6 h-6" />
                إدارة الموظفين
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                عدد الموظفين: {employees.length}
              </p>
            </div>

            {/* Add Employee Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة موظف
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إضافة موظف جديد</DialogTitle>
                </DialogHeader>

                <form onSubmit={saveEmployee} className="space-y-4">
                  <div>
                    <Label>اسم الموظف *</Label>
                    <Input
                      value={employeeData.name}
                      onChange={(e) => setEmployeeData({ ...employeeData, name: e.target.value })}
                      placeholder="اسم الموظف"
                      required
                    />
                  </div>
                  <div>
                    <Label>الوظيفة *</Label>
                    <Input
                      value={employeeData.position}
                      onChange={(e) => setEmployeeData({ ...employeeData, position: e.target.value })}
                      placeholder="المسمى الوظيفي"
                      required
                    />
                  </div>
                  <div>
                    <Label>رقم الهاتف *</Label>
                    <Input
                      type="tel"
                      value={employeeData.phone}
                      onChange={(e) => setEmployeeData({ ...employeeData, phone: e.target.value })}
                      placeholder="01xxxxxxxxx"
                      required
                    />
                  </div>
                  <div>
                    <Label>الراتب *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={employeeData.salary}
                      onChange={(e) => setEmployeeData({ ...employeeData, salary: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label>تاريخ التعيين *</Label>
                    <Input
                      type="date"
                      value={employeeData.hire_date}
                      onChange={(e) => setEmployeeData({ ...employeeData, hire_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-3">
                    <Button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500">
                      حفظ الموظف
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Employee List */}
      <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Briefcase className="w-5 h-5" />
            قائمة الموظفين
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>لا يوجد موظفون بعد</p>
              <p className="text-sm mt-2">قم بإضافة موظف جديد ليظهر هنا</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الوظيفة</TableHead>
                  <TableHead>رقم الهاتف</TableHead>
                  <TableHead>الراتب</TableHead>
                  <TableHead>تاريخ التعيين</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-semibold">{emp.name}</TableCell>
                    <TableCell>{emp.position}</TableCell>
                    <TableCell>{emp.phone}</TableCell>
                    <TableCell>{Number(emp.salary).toFixed(2)} جنية</TableCell>
                    <TableCell className="flex items-center gap-1 text-sm text-gray-700">
                      <Calendar className="w-4 h-4" />
                      {emp.hire_date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Employees;
