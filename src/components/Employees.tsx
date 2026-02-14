import { useState, useEffect, FormEvent, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { User, Plus, Edit, Trash2, Briefcase, Calendar, Mail, Phone, DollarSign, Search, ShieldCheck, Lock as LockIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

const API_URL = API_BASE_URL + "/employees";

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
      const response = await fetch(API_URL);
      const data = await response.json();
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
    return employees.filter(emp => 
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
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editingEmployee ? "update" : "add",
          employee: editingEmployee ? { ...formData, id: editingEmployee.id } : formData,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
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

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });

      const data = await response.json();
      if (data.status === "success") {
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
    <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-white/20 dark:border-slate-800 shadow-2xl rounded-[2.5rem] overflow-hidden" dir="rtl">
      <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-600/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">إدارة الموظفين</CardTitle>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">إدارة الفريق والصلاحيات</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="ابحث عن موظف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 pr-10 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-500/20 font-bold"
              />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all w-full sm:w-auto"
                  onClick={() => {
                    setEditingEmployee(null);
                    resetForm();
                  }}
                >
                  <Plus className="w-5 h-5 ml-2" />
                  إضافة موظف
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg rounded-[2.5rem] p-0 overflow-hidden border-none bg-white dark:bg-slate-900 shadow-2xl" dir="rtl">
                <div className="bg-slate-900 p-6 text-white text-center">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black">{editingEmployee ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}</DialogTitle>
                    <p className="text-slate-400 text-sm font-bold mt-1 uppercase tracking-widest">أدخل بيانات الموظف بدقة</p>
                  </DialogHeader>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-400">الاسم الكامل</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="أدخل الاسم"
                        className="h-12 bg-slate-50 dark:bg-slate-950 border-none rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-400">البريد الإلكتروني</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        className="h-12 bg-slate-50 dark:bg-slate-950 border-none rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-400">المسمى الوظيفي</Label>
                      <Input
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder="مثل: بائع / كاشير"
                        className="h-12 bg-slate-50 dark:bg-slate-950 border-none rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-400">رقم الهاتف</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="01xxxxxxxxx"
                        className="h-12 bg-slate-50 dark:bg-slate-950 border-none rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-400">الراتب الشهري</Label>
                      <div className="relative">
                        <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="number"
                          value={formData.salary}
                          onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                          placeholder="0.00"
                          className="h-12 pr-9 bg-slate-50 dark:bg-slate-950 border-none rounded-xl"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-400">تاريخ التعيين</Label>
                      <div className="relative">
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="date"
                          value={formData.hiring_date}
                          onChange={(e) => setFormData({ ...formData, hiring_date: e.target.value })}
                          className="h-12 pr-9 bg-slate-50 dark:bg-slate-950 border-none rounded-xl"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {!editingEmployee && (
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-400">كلمة المرور</Label>
                      <div className="relative">
                        <LockIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="********"
                          className="h-12 pr-9 bg-slate-50 dark:bg-slate-950 border-none rounded-xl"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg active:scale-95 transition-all">
                      {editingEmployee ? "تحديث البيانات" : "إضافة الموظف"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-12 px-6 rounded-xl font-bold font-black">
                      إلغاء
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-20 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-400 font-bold animate-pulse">جاري تحميل البيانات...</p>
             </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-20 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <User className="w-12 h-12 text-slate-200 dark:text-slate-700" />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">لا يوجد موظفين</h3>
              <p className="text-slate-400 font-bold max-w-xs mx-auto">لم يتم العثور على أي موظفين حالياً. ابدأ بإضافة موظف جديد للفريق.</p>
            </div>
          ) : (
            <div className="p-8">
              <Table>
                <TableHeader>
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-right h-12 text-xs font-black uppercase tracking-widest text-slate-400">الموظف</TableHead>
                    <TableHead className="text-right h-12 text-xs font-black uppercase tracking-widest text-slate-400">الوظيفة</TableHead>
                    <TableHead className="text-right h-12 text-xs font-black uppercase tracking-widest text-slate-400">الاتصال</TableHead>
                    <TableHead className="text-right h-12 text-xs font-black uppercase tracking-widest text-slate-400">الراتب</TableHead>
                    <TableHead className="text-right h-12 text-xs font-black uppercase tracking-widest text-slate-400">تاريخ التعيين</TableHead>
                    <TableHead className="text-left h-12 text-xs font-black uppercase tracking-widest text-slate-400">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((emp) => (
                    <TableRow key={emp.id} className="group border-b border-slate-50 dark:border-slate-800/30 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 font-black">
                            {emp.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800 dark:text-slate-200">{emp.name}</span>
                            <span className="text-[11px] text-slate-400 font-bold">{emp.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-lg font-black bg-blue-50/50 dark:bg-blue-600/5 text-blue-600 border-blue-100 dark:border-blue-900/30 px-3 py-1">
                          {emp.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                           <div className="flex items-center gap-2 text-slate-500">
                             <Phone className="w-3 h-3" />
                             <span className="text-xs font-bold">{emp.phone}</span>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-black text-slate-800 dark:text-slate-200">
                          <span className="text-blue-600 dark:text-blue-400">{Number(emp.salary).toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400">جنية</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-500">
                           <Calendar className="w-4 h-4 text-slate-300" />
                           <span className="text-xs font-bold font-black">{emp.hiring_date}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(emp)}
                            className="h-9 w-9 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(emp.id)}
                            className="h-9 w-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Employees;
