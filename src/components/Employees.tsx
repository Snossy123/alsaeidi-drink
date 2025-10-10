import { useState, useEffect, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { User, Plus, Edit, Trash2, Briefcase, Calendar, Mail, Lock, Phone, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/constants";

const API_URL = API_BASE_URL + "/employees";

interface Employee {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  phone: string;
  salary: string;
  hiring_date: string;
  active?: boolean;
}

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    phone: "",
    salary: "",
    hiring_date: "",
    active: true,
  });

  const { toast } = useToast();

  // 🔹 Fetch Employees
  const fetchEmployees = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data.success) setEmployees(data.employees);
    } catch {
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

  // 🔸 Handle Save (Add / Update)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.role || !formData.phone || !formData.salary || !formData.hiring_date) {
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
        body: JSON.stringify({
          action: editingEmployee ? "update" : "add",
          employee: editingEmployee ? { ...formData, id: editingEmployee.id } : formData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: editingEmployee ? "تم التحديث" : "تمت الإضافة",
          description: data.message,
        });
        setEmployees(data.employees);
        setIsDialogOpen(false);
        setEditingEmployee(null);
        resetForm();
      } else {
        toast({
          title: "فشل العملية",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "خطأ",
        description: "فشل حفظ بيانات الموظف",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "",
      phone: "",
      salary: "",
      hiring_date: "",
      active: true,
    });
  };

  // 🔻 Handle Edit
  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      password: "",
      role: emp.role,
      phone: emp.phone,
      salary: emp.salary,
      hiring_date: emp.hiring_date,
      active: emp.active ?? true,
    });
    setIsDialogOpen(true);
  };

  // 🔻 Handle Delete
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "تم الحذف",
          description: data.message,
        });
        setEmployees(data.employees);
      } else {
        toast({
          title: "فشل الحذف",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "خطأ",
        description: "تعذر الاتصال بالخادم",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-blue-100" dir="rtl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Briefcase className="w-5 h-5" />
            إدارة الموظفين
          </CardTitle>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                onClick={() => {
                  setEditingEmployee(null);
                  resetForm();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                إضافة موظف
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>
                  {editingEmployee ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>الاسم *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="اسم الموظف"
                    required
                  />
                </div>

                <div>
                  <Label>البريد الإلكتروني *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                    required
                  />
                </div>

                {!editingEmployee && (
                  <div>
                    <Label>كلمة المرور *</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="********"
                      required
                    />
                  </div>
                )}

                <div>
                  <Label>الوظيفة *</Label>
                  <Input
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="المسمى الوظيفي"
                    required
                  />
                </div>

                <div>
                  <Label>رقم الهاتف *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01xxxxxxxxx"
                    required
                  />
                </div>

                <div>
                  <Label>الراتب *</Label>
                  <Input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label>تاريخ التعيين *</Label>
                  <Input
                    type="date"
                    value={formData.hiring_date}
                    onChange={(e) => setFormData({ ...formData, hiring_date: e.target.value })}
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500">
                    {editingEmployee ? "تحديث" : "إضافة"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {employees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>لا يوجد موظفون بعد</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الوظيفة</TableHead>
                <TableHead>رقم الهاتف</TableHead>
                <TableHead>الراتب</TableHead>
                <TableHead>تاريخ التعيين</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-semibold">{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.role}</TableCell>
                  <TableCell>{emp.phone}</TableCell>
                  <TableCell>{Number(emp.salary).toFixed(2)} جنيه</TableCell>
                  <TableCell>{emp.hiring_date}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(emp)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(emp.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default Employees;
