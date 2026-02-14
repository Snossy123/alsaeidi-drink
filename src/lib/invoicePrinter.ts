export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  time: string;
  employeeName: string;
  total: number;
  items: any[];
  kitchen_note?: string;
}

export const printInvoice = (data: InvoiceData, isKitchenCopy = false) => {
  const printWindow = window.open("", "_blank", "width=400,height=600");
  if (!printWindow) return;

  const sizeMap: any = { s: "صغير", m: "وسط", l: "كبير" };

  const html = `
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { 
            font-family: 'Arial', sans-serif; 
            width: 72mm;
            margin: 0 auto; 
            padding: 5mm 2mm;
            font-size: 12px;
            line-height: 1.4;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .header-title { font-size: 16px; margin-bottom: 5px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
          .info-table { width: 100%; margin: 5px 0; font-size: 11px; }
          .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .items-table th { border-bottom: 1px solid #000; text-align: right; padding: 4px 0; }
          .items-table td { padding: 5px 0; vertical-align: top; border-bottom: 0.5px solid #eee; }
          .total-section { margin-top: 10px; padding-top: 5px; border-top: 1px dashed #000; }
          .kitchen-note { 
            background: #000; color: #fff; padding: 5px; 
            margin-top: 10px; text-align: center; font-size: 14px; 
          }
          .footer { margin-top: 15px; font-size: 10px; border-top: 1px solid #000; padding-top: 5px; }
        </style>
      </head>
      <body>
        <div class="center bold header-title">
          ${isKitchenCopy ? "طلب مطبخ - Kitchen" : "فاتورة مبيعات"}
        </div>
        
        <table class="info-table">
          <tr><td>رقم الفاتورة:</td><td class="bold">${data.invoiceNumber}</td></tr>
          <tr><td>التاريخ:</td><td>${data.date} ${data.time}</td></tr>
          <tr><td>الكاشير:</td><td>${data.employeeName}</td></tr>
        </table>
        
        ${isKitchenCopy && data.kitchen_note
          ? `<div class="kitchen-note bold">⚠️ ملاحظة: ${data.kitchen_note}</div>`
          : ""
        }

        <table class="items-table">
          <thead>
            <tr>
              <th width="45%">المنتج</th>
              <th width="15%">سعر</th>
              <th width="15%">كمية</th>
              <th width="25%" style="text-align:left">إجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map((item: any) => `
              <tr>
                <td>
                  <span class="bold">${item.name}</span>
                  ${item.size ? `<br/><small>(${sizeMap[item.size] || item.size})</small>` : ""}
                </td>
                <td>${item.price}</td>
                <td class="center">${item.quantity}</td>
                <td style="text-align:left" class="bold">${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="total-section">
          <div style="display: flex; justify-content: space-between; font-size: 16px;" class="bold">
            <span>الإجمالي النهائي:</span>
            <span>${data.total.toFixed(2)} ج</span>
          </div>
        </div>

        <div class="center footer">
          ${isKitchenCopy ? "--- نسخة المطبخ ---" : "شكراً لزيارتكم! نرجو رؤيتكم قريباً"}
          <br/>
          ${new Date().toLocaleString('ar-EG')}
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 500);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
