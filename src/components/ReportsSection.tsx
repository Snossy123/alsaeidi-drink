
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Calendar, TrendingUp, ShoppingCart, Package, DollarSign } from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";


const API_URL = API_BASE_URL;

const ReportsSection = () => {
  const [selectedReport, setSelectedReport] = useState("sales");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Mock data for different reports
  const [reportData, setReportData] = useState([]);

  const generateReport = async () => {
    if (!dateFrom || !dateTo) {
      alert("يرجى تحديد تاريخ البداية والنهاية");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/reports?type=${selectedReport}&from=${dateFrom}&to=${dateTo}`
      );
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error("فشل في جلب التقرير:", error);
    }
  };

  useEffect(() => {
    if (dateFrom && dateTo) {
      generateReport();
    }
  }, [selectedReport]);

  const renderReportContent = () => {
    switch (selectedReport) {
      case "sales":
        return (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <TrendingUp className="w-5 h-5" />
                  تقرير المبيعات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">التاريخ</TableHead>
                          <TableHead className="text-right">عدد الفواتير</TableHead>
                          <TableHead className="text-right">إجمالي المبيعات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-right">{item.date}</TableCell>
                            <TableCell className="text-right">{item.invoices}</TableCell>
                            <TableCell className="font-semibold text-blue-600 text-right">
                              {Number(item.total).toFixed(2)} جنية
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} جنية`, 'المبيعات']} />
                        <Bar dataKey="total" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "purchases":
        return (
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <ShoppingCart className="w-5 h-5" />
                تقرير المشتريات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">عدد الفواتير</TableHead>
                    <TableHead className="text-right">عدد الأصناف</TableHead>
                    <TableHead className="text-right">إجمالي المشتريات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-right">{item.date}</TableCell>
                      <TableCell className="text-right">{item.invoices}</TableCell>
                      <TableCell className="text-right">{item.items}</TableCell>
                      <TableCell className="font-semibold text-green-600 text-right">
                        {Number(item.total).toFixed(2)} جنية
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "profits":
        return (
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <DollarSign className="w-5 h-5" />
                تقرير الأرباح
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">المبيعات</TableHead>
                    <TableHead className="text-right">المشتريات</TableHead>
                    <TableHead className="text-right">صافي الربح</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-right">{item.date}</TableCell>
                      <TableCell className="text-blue-600 text-right">{Number(item.sales).toFixed(2)} جنية</TableCell>
                      <TableCell className="text-red-600 text-right">{Number(item.purchases).toFixed(2)} جنية</TableCell>
                      <TableCell className="font-semibold text-green-600 text-right">
                        {Number(item.profit).toFixed(2)} جنية
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "top-selling":
        return (
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <TrendingUp className="w-5 h-5" />
                المنتجات الأكثر مبيعاً
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المنتج</TableHead>
                    <TableHead className="text-right">الكمية المباعة</TableHead>
                    <TableHead className="text-right">إجمالي الإيرادات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-right">{item.product_name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="font-semibold text-blue-600 text-right">
                        {Number(item.revenue).toFixed(2)} جنية
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "purchased-items":
        return (
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Package className="w-5 h-5" />
                المنتجات التي تم شراؤها
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المنتج</TableHead>
                    <TableHead className="text-right">الكمية المشتراة</TableHead>
                    <TableHead className="text-right">إجمالي التكلفة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-right">{item.product_name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="font-semibold text-green-600 text-right">
                        {Number(item.cost).toFixed(2)} جنية
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "sold-items":
        return (
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Package className="w-5 h-5" />
                المنتجات التي تم بيعها
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المنتج</TableHead>
                    <TableHead className="text-right">الكمية المباعة</TableHead>
                    <TableHead className="text-right">الكمية المتبقية</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-right">{item.product_name}</TableCell>
                      <TableCell className="text-blue-600 text-right">{item.quantity_sold}</TableCell>
                      <TableCell className="font-semibold text-orange-600 text-right">
                        {item.remaining}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-blue-800">التقارير والإحصائيات</h2>
      </div>

      {/* Report Selection and Filters */}
      <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <FileText className="w-6 h-6" />
            إعدادات التقرير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>نوع التقرير</Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">تقرير المبيعات</SelectItem>
                  <SelectItem value="purchases">تقرير المشتريات</SelectItem>
                  <SelectItem value="profits">تقرير الأرباح</SelectItem>
                  <SelectItem value="top-selling">المنتجات الأكثر مبيعاً</SelectItem>
                  <SelectItem value="purchased-items">المنتجات المشتراة</SelectItem>
                  <SelectItem value="sold-items">المنتجات المباعة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>من تاريخ</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>إلى تاريخ</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="invisible">إجراءات</Label>
              <Button 
                onClick={generateReport}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
              >
                <Calendar className="w-4 h-4 mr-2" />
                إنشاء التقرير
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  );
};

export default ReportsSection;
