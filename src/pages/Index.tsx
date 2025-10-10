
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, FileText, BarChart3, Plus, Search, Calculator, Receipt } from "lucide-react";
import SalesInterface from "@/components/SalesInterface";
import ProductManagement from "@/components/ProductManagement";
import PurchaseInvoices from "@/components/PurchaseInvoices";
import ReportsSection from "@/components/ReportsSection";
import SalesInvoices from "@/components/SalesInvoices";
import Employees from "@/components/Employees";

const Index = () => {
  const [activeTab, setActiveTab] = useState("sales");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  نظام نقطة البيع
                </h1>
                <p className="text-sm text-gray-600">إدارة ذكية للمبيعات والمخزون</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                متصل
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                المتجر الرئيسي
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation Tabs - الترتيب من اليمين لليسار */}
          <TabsList
              className="
                grid 
                w-full 
                grid-cols-6 
                bg-white/70 
                backdrop-blur-md 
                border border-blue-100 
                shadow-sm 
                rounded-2xl 
                h-16 
                overflow-hidden
              "
              dir="rtl"
            >
              {[
                { value: "reports", label: "التقارير", icon: BarChart3 },
                { value: "employees", label: "الموظفين", icon: FileText },
                { value: "invoices", label: "فواتير الشراء", icon: FileText },
                { value: "sales-invoices", label: "فواتير المبيعات", icon: Receipt },
                { value: "products", label: "المنتجات", icon: Package },
                { value: "sales", label: "نقطة البيع", icon: ShoppingCart },
              ].map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="
                    flex 
                    flex-col 
                    items-center 
                    justify-center 
                    gap-1 
                    text-gray-700 
                    font-medium 
                    transition-all 
                    duration-300 
                    hover:bg-blue-50 
                    hover:text-blue-700 
                    data-[state=active]:text-white 
                    data-[state=active]:bg-gradient-to-r 
                    data-[state=active]:from-blue-500 
                    data-[state=active]:to-purple-500
                  "
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[13px]">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>


          {/* Tab Content */}
          <TabsContent value="sales" className="m-0">
            <SalesInterface />
          </TabsContent>

          <TabsContent value="products" className="m-0">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="sales-invoices" className="m-0">
            <SalesInvoices />
          </TabsContent>

          <TabsContent value="invoices" className="m-0">
            <PurchaseInvoices />
          </TabsContent>

          <TabsContent value="employees" className="m-0">
            <Employees />
          </TabsContent>

          <TabsContent value="reports" className="m-0">
            <ReportsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
