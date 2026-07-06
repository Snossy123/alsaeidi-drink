import { useState, useEffect, FormEvent, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  User,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Mail,
  Phone,
  DollarSign,
  Search,
  Users,
  Lock as LockIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { Badge } from "@/components/ui/badge";

interface Employee {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: string;
  phone: string;
  salary: string;
  hiring_date: string;
  active?: boolean;
}

function formatHireDate(date: string) {
  if (!date) return "—";
  return date.includes("T") ? date.split("T")[0] : date;
}

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
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

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await apiClient<{ status: string; employees: Employee[] }>("/employees");
      if (data.status === "success") setEmployees(data.employees);
    } catch {
      toast({
        title: "خطأ",
        description: "تعذر تحميل بيانات الموظفين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

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
      const data = await apiClient<{ success: boolean; employees: Employee[]; message?: string }>("/employees", {
        method: "POST",
        body: JSON.stringify({
          action: editingEmployee ? "update" : "add",
          employee: editingEmployee ? { ...formData, id: editingEmployee.id } : formData,
        }),
      });

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

  const openAddDialog = () => {
    setEditingEmployee(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      password: "",
      role: emp.role,
      phone: emp.phone,
      salary: emp.salary,
      hiring_date: formatHireDate(emp.hiring_date),
      active: emp.active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموظف؟")) return;
    try {
      const data = await apiClient<{ success: boolean; employees: Employee[]; message?: string }>("/employees", {
        method: "POST",
        body: JSON.stringify({ action: "delete", id }),
      });

      if (data.success) {
        toast({ title: "تم الحذف", description: data.message });
        setEmployees(data.employees);
      } else {
        toast({ title: "فشل الحذف", description: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "خطأ", description: "تعذر الاتصال بالخادم", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-3 antialiased" dir="rtl">
      {/* Header */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">إدارة الموظفين</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">إدارة الفريق والصلاحيات</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2">
            <Users className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <p className="text-[9px] font-bold text-slate-400 leading-none">الموظفين</p>
              <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">{filteredEmployees.length}</p>
            </div>
          </div>
          <Button onClick={openAddDialog} className="h-10 shrink-0 bg-blue-600 hover:bg-blue-700 font-bold text-sm px-4 rounded-xl gap-1.5">
            <Plus className="w-4 h-4" />
            إضافة موظف
          </Button>
        </div>
      </div>

      {/* Search — sticky, high z-index */}
      <div className="sticky top-0 z-40 shrink-0 isolate rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-sm p-3 sm:px-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="ابحث عن موظف بالاسم، الوظيفة، أو البريد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 pr-10 rounded-xl text-sm font-bold"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-red-500"
            >
              مسح
            </button>
          )}
        </div>
      </div>

      {/* Employee list — scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain space-y-2 relative z-0 pb-1">
        {loading ? (
          <div className="min-h-[200px] flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-400">جاري تحميل البيانات...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="min-h-[200px] flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <User className="w-10 h-10 mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-400">لا يوجد موظفين</p>
          </div>
        ) : (
          filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 font-black shrink-0">
                  {emp.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-sm text-slate-800 dark:text-slate-100 truncate">{emp.name}</h3>
                    <Badge variant="outline" className="text-[10px] font-black h-5 px-2 bg-blue-50/50 dark:bg-blue-600/10 text-blue-600 border-blue-200 dark:border-blue-800">
                      {emp.role}
                    </Badge>
                    {emp.active === false && (
                      <Badge variant="secondary" className="text-[10px] h-5">غير نشط</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 min-w-0 truncate">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 shrink-0" />
                      {emp.phone || "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 shrink-0" />
                      {formatHireDate(emp.hiring_date)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <div className="text-left sm:text-right">
                  <p className="text-base font-black text-blue-600 dark:text-blue-400 tabular-nums">
                    {Number(emp.salary).toLocaleString()} <span className="text-[10px] text-slate-400">ج</span>
                  </p>
                  <p className="text-[10px] font-bold text-slate-400">الراتب الشهري</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleEdit(emp)}
                    className="h-8 w-8 rounded-lg text-slate-500 hover:text-blue-600"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleDelete(emp.id)}
                    className="h-8 w-8 rounded-lg text-slate-500 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingEmployee(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90dvh] rounded-2xl p-0 overflow-y-auto border-none bg-white dark:bg-slate-900 shadow-2xl" dir="rtl">
          <div className="bg-slate-900 px-5 py-4 text-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-black">
                {editingEmployee ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}
              </DialogTitle>
              <p className="text-slate-400 text-xs font-bold mt-0.5">أدخل بيانات الموظف بدقة</p>
            </DialogHeader>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500">الاسم الكامل</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل الاسم"
                  className="h-10 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500">البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="h-10 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500">المسمى الوظيفي</Label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="مثل: كاشير"
                  className="h-10 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500">رقم الهاتف</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01xxxxxxxxx"
                  className="h-10 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500">الراتب الشهري</Label>
                <div className="relative">
                  <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="0.00"
                    className="h-10 pr-9 rounded-xl"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500">تاريخ التعيين</Label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="date"
                    value={formData.hiring_date}
                    onChange={(e) => setFormData({ ...formData, hiring_date: e.target.value })}
                    className="h-10 pr-9 rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>

            {!editingEmployee && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500">كلمة المرور</Label>
                <div className="relative">
                  <LockIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="********"
                    className="h-10 pr-9 rounded-xl"
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 font-black rounded-xl">
                {editingEmployee ? "تحديث البيانات" : "إضافة الموظف"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-10 px-5 rounded-xl font-bold">
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;
