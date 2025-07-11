
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, FileText, Calendar, User, Printer } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
}

interface SaleInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  time: string;
  items: CartItem[];
  total: number;
  cashier: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const SalesInvoices = () => {
  const [invoices, setInvoices] = useState<SaleInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<SaleInvoice | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch(API_URL + "/sales-invoices");
        const data = await res.json();

        if (data.status === "success" && Array.isArray(data.invoices)) {
          setInvoices(data.invoices);
        } else {
          console.error("API Response Error:", data.message || "Unknown error");
        }
      } catch (error) {
        console.error("API Error:", error);
      }
    };

    fetchInvoices();
  }, []);



  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <FileText className="w-6 h-6" />
            فواتير المبيعات
          </CardTitle>
          <p className="text-sm text-gray-600">
            إجمالي الفواتير: {invoices.length} فاتورة
          </p>
        </CardHeader>
      </Card>

      {/* Sales Invoices List */}
      <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Receipt className="w-5 h-5" />
            قائمة الفواتير ({invoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>لا توجد فواتير مبيعات حتى الآن</p>
              <p className="text-sm mt-2">ستظهر الفواتير هنا بعد إتمام عمليات البيع</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id} className="border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setIsInvoiceDialogOpen(true);
                      }}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-blue-600 border-blue-300">
                            {invoice.invoiceNumber}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {invoice.items.length} منتج
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {invoice.date} - {invoice.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {invoice.cashier}
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-bold text-blue-600">
                          {Number(invoice.total).toFixed(2)} ريال
                        </div>
                        <Button variant="ghost" size="sm" className="mt-1">
                          عرض التفاصيل
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Details Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              تفاصيل الفاتورة {selectedInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">رقم الفاتورة</span>
                  <p className="font-semibold">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">التاريخ</span>
                  <p className="font-semibold">{selectedInvoice.date}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">الوقت</span>
                  <p className="font-semibold">{selectedInvoice.time}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">البائع</span>
                  <p className="font-semibold">{selectedInvoice.cashier}</p>
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <h3 className="text-lg font-semibold mb-4">تفاصيل المنتجات</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المنتج</TableHead>
                      <TableHead className="text-right">السعر</TableHead>
                      <TableHead className="text-right">الكمية</TableHead>
                      <TableHead className="text-right">الإجمالي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.price.toFixed(2)} ريال</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="font-semibold">
                          {(item.price * item.quantity).toFixed(2)} ريال
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Invoice Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>المبلغ الإجمالي:</span>
                  <span className="text-blue-600">{selectedInvoice.total.toFixed(2)} ريال</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500">
                  <Printer className="w-4 h-4 mr-2" />
                  طباعة الفاتورة
                </Button>
                <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesInvoices;
