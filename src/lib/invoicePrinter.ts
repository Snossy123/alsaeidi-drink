import type { OrderType, PaymentStatus } from "@/types/salesInvoice";
import { orderTypeLabels } from "@/types/salesInvoice";

export const SHOP_NAME = "الصعيدي درينك";
export const SOFTWARE_BRAND = "sensu sw";

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  time: string;
  employeeName: string;
  total: number;
  items: any[];
  kitchen_note?: string;
  order_type?: OrderType;
  payment_status?: PaymentStatus;
}

const paymentStatusLabels: Record<string, string> = {
  paid: "مدفوع",
  unpaid: "غير مدفوع",
  partial: "مدفوع جزئياً",
};

const sizeMap: Record<string, string> = { s: "صغير", m: "وسط", l: "كبير" };

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const printInvoice = (data: InvoiceData, isKitchenCopy = false) => {
  const total = Number(data.total) || 0;
  const orderLabel = data.order_type ? orderTypeLabels[data.order_type] : "تيك اوي";
  const paymentLabel = data.payment_status ? paymentStatusLabels[data.payment_status] : "مدفوع";

  const itemRows = data.items
    .map((item: any) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      const lineTotal = price * quantity;
      const sizeLabel = item.size ? ` (${sizeMap[item.size] || item.size})` : "";

      return `
        <tr>
          <td class="col-name">
            <span class="item-name">${escapeHtml(item.name)}${escapeHtml(sizeLabel)}</span>
          </td>
          <td class="col-qty">${quantity}</td>
          <td class="col-price">${price.toFixed(2)}</td>
          <td class="col-total">${lineTotal.toFixed(2)}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title> </title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }

          @media print {
            html, body {
              width: 80mm;
              margin: 0 !important;
              padding: 0 !important;
            }
          }

          * {
            box-sizing: border-box;
          }

          html, body {
            width: 80mm;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: Arial, Tahoma, "Segoe UI", sans-serif;
            font-size: 11px;
            line-height: 1.35;
            color: #000;
            background: #fff;
            direction: rtl;
            text-align: right;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .receipt {
            width: 76mm;
            max-width: 76mm;
            margin: 0 auto;
            padding: 3mm 2mm 4mm;
          }

          .center { text-align: center; }

          .shop-name {
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0.2px;
            margin-bottom: 2px;
          }

          .doc-type {
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 6px;
          }

          .divider {
            border: none;
            border-top: 1px dashed #000;
            margin: 6px 0;
          }

          .meta-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 4px;
            margin-bottom: 3px;
            font-size: 10px;
          }

          .meta-label {
            flex: 0 0 auto;
            color: #222;
            white-space: nowrap;
          }

          .meta-value {
            flex: 1 1 auto;
            text-align: left;
            direction: ltr;
            font-weight: 700;
            word-break: break-all;
          }

          .meta-value.rtl {
            direction: rtl;
            text-align: left;
            word-break: normal;
          }

          .kitchen-note {
            background: #000;
            color: #fff;
            padding: 4px 6px;
            margin: 6px 0;
            text-align: center;
            font-size: 12px;
            font-weight: 700;
          }

          .items-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin-top: 4px;
            font-size: 10px;
          }

          .items-table th,
          .items-table td {
            padding: 3px 1px;
            vertical-align: top;
          }

          .items-table thead th {
            border-bottom: 1px solid #000;
            font-size: 9px;
            font-weight: 700;
            padding-bottom: 4px;
          }

          .items-table tbody td {
            border-bottom: 0.5px solid #ddd;
            padding-top: 4px;
            padding-bottom: 4px;
          }

          .col-name { width: 44%; }
          .col-qty { width: 10%; text-align: center; }
          .col-price { width: 22%; text-align: center; direction: ltr; }
          .col-total { width: 24%; text-align: left; direction: ltr; font-weight: 700; }

          .item-name {
            display: block;
            word-break: break-word;
            overflow-wrap: anywhere;
            line-height: 1.3;
          }

          .total-section {
            margin-top: 8px;
            padding-top: 6px;
            border-top: 1px dashed #000;
          }

          .grand-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            font-weight: 700;
          }

          .grand-total .amount {
            direction: ltr;
            text-align: left;
          }

          .footer {
            margin-top: 10px;
            padding-top: 6px;
            border-top: 1px solid #000;
            text-align: center;
            font-size: 10px;
            line-height: 1.5;
          }

          .brand {
            margin-top: 6px;
            font-size: 9px;
            letter-spacing: 0.5px;
            direction: ltr;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="center shop-name">${SHOP_NAME}</div>
          <div class="center doc-type">
            ${isKitchenCopy ? "طلب مطبخ" : "فاتورة مبيعات"}
          </div>

          <hr class="divider" />

          <div class="meta-row">
            <span class="meta-label">رقم الفاتورة:</span>
            <span class="meta-value">${escapeHtml(data.invoiceNumber)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">التاريخ:</span>
            <span class="meta-value">${escapeHtml(data.date)} ${escapeHtml(data.time)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">الكاشير:</span>
            <span class="meta-value rtl">${escapeHtml(data.employeeName)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">نوع الطلب:</span>
            <span class="meta-value rtl">${escapeHtml(orderLabel)}</span>
          </div>
          ${
            !isKitchenCopy
              ? `<div class="meta-row">
                  <span class="meta-label">حالة الدفع:</span>
                  <span class="meta-value rtl">${escapeHtml(paymentLabel)}</span>
                </div>`
              : ""
          }

          ${
            isKitchenCopy && data.kitchen_note
              ? `<div class="kitchen-note">ملاحظة: ${escapeHtml(data.kitchen_note)}</div>`
              : ""
          }

          <table class="items-table">
            <thead>
              <tr>
                <th class="col-name">الصنف</th>
                <th class="col-qty">ك</th>
                <th class="col-price">السعر</th>
                <th class="col-total">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <div class="total-section">
            <div class="grand-total">
              <span>الإجمالي النهائي:</span>
              <span class="amount">${total.toFixed(2)} ج</span>
            </div>
          </div>

          <div class="footer">
            ${
              isKitchenCopy
                ? "--- نسخة المطبخ ---"
                : "شكراً لزيارتكم<br/>نرجو رؤيتكم قريباً"
            }
            <div class="brand">${SOFTWARE_BRAND}</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.focus();
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const frameDoc = frameWindow?.document;
  if (!frameWindow || !frameDoc) {
    document.body.removeChild(iframe);
    return;
  }

  frameDoc.open();
  frameDoc.write(html);
  frameDoc.close();

  const cleanup = () => {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  };

  const triggerPrint = () => {
    frameWindow.focus();
    frameWindow.print();
    frameWindow.addEventListener("afterprint", cleanup, { once: true });
    setTimeout(cleanup, 2000);
  };

  if (frameDoc.readyState === "complete") {
    triggerPrint();
  } else {
    iframe.onload = triggerPrint;
  }
};
