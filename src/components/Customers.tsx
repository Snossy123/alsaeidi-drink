import { useState, useEffect, FormEvent, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Phone, Plus, Edit, Trash2, Search, UserRound, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";

interface Customer {
  id: number;
  name: string;
  phone: string;
  address_notes?: string | null;
}

const emptyForm = {
  name: "",
  phone: "",
  address_notes: "",
};

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await apiClient<{ status: string; customers: Customer[] }>("/customers");
      if (data.status === "success") setCustomers(data.customers);
    } catch {
      toast({
        title: "خطأ",
        description: "تعذر تحميل بيانات العملاء",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.address_notes || "").toLowerCase().includes(q)
    );
  }, [customers, searchTerm]);

  const resetForm = () => setFormData(emptyForm);

  const openAddDialog = () => {
    setEditingCustomer(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address_notes: customer.address_notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "الاسم ورقم التليفون مطلوبان",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address_notes: formData.address_notes.trim() || null,
      };

      const data = editingCustomer
        ? await apiClient<{ status: string; customers: Customer[]; message?: string }>(
            `/customers/${editingCustomer.id}`,
            { method: "PATCH", body: JSON.stringify(payload) }
          )
        : await apiClient<{ status: string; customers: Customer[]; message?: string }>("/customers", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      if (data.status === "success") {
        toast({
          title: editingCustomer ? "تم التحديث" : "تمت الإضافة",
          description: data.message,
        });
        setCustomers(data.customers);
        setIsDialogOpen(false);
        setEditingCustomer(null);
        resetForm();
      } else {
        toast({ title: "فشل العملية", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error?.message || "فشل حفظ بيانات العميل",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا العميل؟")) return;
    try {
      const data = await apiClient<{ status: string; customers: Customer[]; message?: string }>(
        `/customers/${id}`,
        { method: "DELETE" }
      );
      if (data.status === "success") {
        toast({ title: "تم الحذف", description: data.message });
        setCustomers(data.customers);
      } else {
        toast({ title: "فشل الحذف", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({
        title: "فشل الحذف",
        description: error?.message || "لا يمكن حذف العميل",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col gap-3 p-3 lg:p-4 overflow-hidden" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white">العملاء</h1>
            <p className="text-xs font-bold text-slate-500">{customers.length} عميل مسجّل</p>
          </div>
        </div>
        <Button
          onClick={openAddDialog}
          className="h-10 rounded-xl bg-blue-600 hover:bg-blue-500 font-black gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة عميل
        </Button>
      </div>

      <div className="relative shrink-0">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="بحث بالاسم أو التليفون أو العنوان..."
          className="h-11 pr-10 rounded-xl font-bold"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
        {loading ? (
          <p className="text-center text-sm font-bold text-slate-400 py-12">جاري التحميل...</p>
        ) : filteredCustomers.length === 0 ? (
          <div className="min-h-[200px] flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400 gap-2">
            <UserRound className="w-10 h-10 opacity-50" />
            <p className="text-sm font-black">لا يوجد عملاء</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3 flex items-start justify-between gap-3"
            >
              <div className="min-w-0 space-y-1.5">
                <p className="font-black text-base text-slate-800 dark:text-white flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">{customer.name}</span>
                </p>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2" dir="ltr">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  {customer.phone}
                </p>
                {customer.address_notes ? (
                  <p className="text-sm font-bold text-slate-500 flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{customer.address_notes}</span>
                  </p>
                ) : null}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg"
                  onClick={() => handleEdit(customer)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg text-red-500 hover:text-red-600"
                  onClick={() => handleDelete(customer.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg">
              {editingCustomer ? "تعديل عميل" : "إضافة عميل"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-black text-sm">الاسم</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                className="h-11 rounded-xl font-bold"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-black text-sm">رقم التليفون</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
                className="h-11 rounded-xl font-bold"
                dir="ltr"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-black text-sm">ملاحظات العنوان</Label>
              <Input
                value={formData.address_notes}
                onChange={(e) => setFormData((f) => ({ ...f, address_notes: e.target.value }))}
                className="h-11 rounded-xl font-bold"
                placeholder="الشارع، المعلم..."
              />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 font-black">
              {editingCustomer ? "حفظ التعديلات" : "إضافة"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
