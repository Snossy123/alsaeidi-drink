import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Calculator, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { AuthUserType } from "@/types/auth";

const Login = () => {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const [type, setType] = useState<AuthUserType>("employee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await login(type, email, password);
      toast({ title: "تم تسجيل الدخول بنجاح" });
    } catch (error: any) {
      toast({
        title: "فشل تسجيل الدخول",
        description: error?.data?.message || error?.message || "تحقق من البيانات",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-svh mesh-bg flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
            <Calculator className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black">سنسو POS</h1>
          <p className="text-sm text-muted-foreground">تسجيل الدخول للمتابعة</p>
        </div>

        <Tabs value={type} onValueChange={(v) => setType(v as AuthUserType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="employee">موظف / كاشير</TabsTrigger>
            <TabsTrigger value="admin">مدير النظام</TabsTrigger>
          </TabsList>

          <TabsContent value={type}>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-bold">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 font-black" disabled={submitting}>
                {submitting ? "جاري الدخول..." : "دخول"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
