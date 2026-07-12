import type { OrderType, PaymentMethod, PaymentStatus } from "@/types/salesInvoice";
import { orderTypeLabels } from "@/types/salesInvoice";
import {
  APP_NAME,
  DEV_COMPANY,
  DEV_NAME,
  DEV_PHONE,
  SHOP_ADDRESS,
  SHOP_SLOGAN,
} from "@/lib/branding";

export { APP_NAME as SHOP_NAME } from "@/lib/branding";

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
  payment_method?: PaymentMethod;
  amount_paid?: number;
  change_given?: number;
  shift_id?: number | string;
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

const formatReceiptDateTime = (date: string, time: string) => {
  const parts = date.split("-");
  if (parts.length !== 3) return `${date} ${time}`;

  const [year, month, day] = parts;
  const [hourStr, minute = "00"] = time.split(":");
  const hour = Number(hourStr);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  return `${period} ${String(hour12).padStart(2, "0")}:${minute} ${day}/${month}/${year}`;
};

/** Daily sequence from INV-YYYYMMDD-0001 → "1" */
const displayInvoiceNo = (invoiceNumber: string) => {
  const parts = String(invoiceNumber ?? "").split("-");
  const seq = parts.length >= 3 ? parts[parts.length - 1] : invoiceNumber;
  const asNum = Number(seq);
  if (Number.isFinite(asNum) && asNum > 0) return String(asNum);
  const digits = String(invoiceNumber ?? "").replace(/\D/g, "");
  if (digits.length >= 1) return String(Number(digits.slice(-4)) || digits.slice(-4));
  return invoiceNumber || "";
};

export const printInvoice = (data: InvoiceData, isKitchenCopy = false): Promise<void> =>
  new Promise((resolve) => {
    const total = Number(data.total) || 0;
    const orderLabel = data.order_type ? orderTypeLabels[data.order_type] : "تيك اوي";
    const paymentLabel = data.payment_status ? paymentStatusLabels[data.payment_status] : "مدفوع";
    const paidAmount =
      data.payment_status === "paid"
        ? Number(data.amount_paid ?? total)
        : Number(data.amount_paid ?? 0);
    const changeGiven = Number(data.change_given ?? Math.max(0, paidAmount - total));
    const shortNo = displayInvoiceNo(data.invoiceNumber);
    const dateTime = formatReceiptDateTime(data.date, data.time);

    const itemBlocks = data.items
      .map((item: any) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        const lineTotal = price * quantity;
        const sizeLabel = item.size ? ` (${sizeMap[item.size] || item.size})` : "";
        const name = `${escapeHtml(item.name)}${escapeHtml(sizeLabel)}`;

        if (isKitchenCopy) {
          return `
            <div class="item kitchen-item">
              <div class="kitchen-qty">${quantity}</div>
              <div class="kitchen-name">${name}</div>
            </div>
          `;
        }

        return `
          <div class="item">
            <div class="item-name">${name}</div>
            <div class="item-line">
              <span class="item-qty-price">${quantity} × ${price.toFixed(2)}</span>
              <span class="item-total">${lineTotal.toFixed(2)}</span>
            </div>
          </div>
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
              size: 80mm 210mm;
              margin: 0;
            }

            @media print {
              html, body {
                width: 72mm !important;
                height: auto !important;
                min-height: 0 !important;
                margin: 0 auto !important;
                padding: 0 !important;
                overflow: hidden !important;
              }

              .receipt {
                page-break-after: avoid;
                page-break-inside: avoid;
              }
            }

            * { box-sizing: border-box; }

            html, body {
              width: 72mm;
              margin: 0 auto;
              padding: 0;
            }

            body {
              font-family: Arial, Tahoma, "Segoe UI", sans-serif;
              font-size: 18px;
              line-height: 1.35;
              color: #000;
              background: #fff;
              direction: rtl;
              text-align: right;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .receipt {
              width: 72mm;
              max-width: 72mm;
              margin: 0 auto;
              padding: 0;
            }

            .bar {
              background: #000;
              color: #fff;
              text-align: center;
              font-weight: 700;
              padding: 6px 3px;
            }

            .shop-bar {
              font-size: 22px;
              letter-spacing: 0.3px;
            }

            .order-no-box {
              margin: 8px auto 4px;
              width: fit-content;
              min-width: 48px;
              padding: 4px 14px;
              border: 2px solid #000;
              text-align: center;
              font-size: 42px;
              font-weight: 700;
              direction: ltr;
              letter-spacing: 1px;
            }

            .order-type {
              text-align: center;
              font-size: 16px;
              font-weight: 700;
              margin-bottom: 6px;
            }

            .meta-block {
              padding: 0 1mm 4px;
              font-size: 15px;
            }

            .meta-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 4px;
              margin-bottom: 3px;
            }

            .meta-label {
              color: #333;
              white-space: nowrap;
            }

            .meta-value {
              font-weight: 700;
              direction: ltr;
              text-align: left;
            }

            .meta-value.rtl {
              direction: rtl;
              text-align: left;
            }

            .rule {
              border: none;
              border-top: 1px solid #000;
              margin: 4px 0;
            }

            .kitchen-note {
              background: #000;
              color: #fff;
              padding: 5px 5px;
              margin: 4px 1mm;
              text-align: center;
              font-size: 16px;
              font-weight: 700;
            }

            .items {
              padding: 2px 1mm 0;
            }

            .item {
              padding: 5px 0;
              border-bottom: 1px dashed #999;
            }

            .item:last-child {
              border-bottom: none;
            }

            .item-name {
              font-size: 27px;
              font-weight: 700;
              line-height: 1.35;
              margin-bottom: 3px;
              word-break: break-word;
            }

            .item-line {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 6px;
              font-size: 17px;
            }

            .item-qty-price {
              direction: ltr;
              unicode-bidi: isolate;
            }

            .item-total {
              direction: ltr;
              font-weight: 700;
              unicode-bidi: isolate;
            }

            .kitchen-item {
              display: flex;
              align-items: flex-start;
              gap: 8px;
              padding: 6px 0;
            }

            .kitchen-qty {
              flex-shrink: 0;
              min-width: 32px;
              font-size: 28px;
              font-weight: 700;
              line-height: 1.2;
              text-align: center;
              direction: ltr;
            }

            .kitchen-name {
              flex: 1;
              font-size: 26px;
              font-weight: 700;
              line-height: 1.35;
              word-break: break-word;
            }

            .totals {
              padding: 4px 1mm 0;
              font-size: 17px;
            }

            .total-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 3px;
            }

            .total-row .val {
              direction: ltr;
              font-weight: 700;
            }

            .grand-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #000;
              color: #fff;
              padding: 7px 1mm;
              margin: 4px 0;
              font-size: 24px;
              font-weight: 700;
            }

            .grand-bar .val {
              direction: ltr;
            }

            .footer {
              text-align: center;
              padding: 6px 1mm 2mm;
              font-size: 11px;
              line-height: 1.4;
            }

            .slogan {
              font-weight: 700;
              margin-bottom: 3px;
              font-size: 12px;
            }

            .address-bar {
              font-size: 11px;
              padding: 4px;
              margin-top: 4px;
            }

            .brand {
              margin-top: 4px;
              padding-top: 3px;
              border-top: 0.5px dashed #999;
              font-size: 7px;
              color: #444;
              direction: ltr;
              line-height: 1.35;
              text-align: center;
            }

            .brand-company {
              font-weight: 700;
              font-size: 7.5px;
            }

            .kitchen-footer {
              text-align: center;
              font-size: 12px;
              font-weight: 700;
              padding: 6px 1mm 2mm;
              border-top: 1px dashed #000;
              margin-top: 6px;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="bar shop-bar">${escapeHtml(APP_NAME)}</div>

            <div class="order-no-box">${escapeHtml(shortNo)}</div>
            <div class="order-type">${escapeHtml(isKitchenCopy ? "طلب مطبخ" : orderLabel)}</div>

            <div class="meta-block">
              ${
                data.shift_id
                  ? `<div class="meta-row">
                      <span class="meta-label">الوردية:</span>
                      <span class="meta-value">${escapeHtml(data.shift_id)}</span>
                    </div>`
                  : ""
              }
              <div class="meta-row">
                <span class="meta-label">الوقت:</span>
                <span class="meta-value">${escapeHtml(dateTime)}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">الكاشير:</span>
                <span class="meta-value rtl">${escapeHtml(data.employeeName)}</span>
              </div>
              ${
                !isKitchenCopy
                  ? `<div class="meta-row">
                      <span class="meta-label">حالة الدفع:</span>
                      <span class="meta-value rtl">${escapeHtml(paymentLabel)}</span>
                    </div>`
                  : ""
              }
            </div>

            <hr class="rule" />

            ${
              isKitchenCopy && data.kitchen_note
                ? `<div class="kitchen-note">ملاحظة: ${escapeHtml(data.kitchen_note)}</div>`
                : ""
            }

            <div class="items">${itemBlocks}</div>

            ${
              isKitchenCopy
                ? `<div class="kitchen-footer">--- نسخة المطبخ ---</div>`
                : `<hr class="rule" />
                   <div class="totals">
                     <div class="grand-bar">
                       <span>الاجمالي</span>
                       <span class="val">${total.toFixed(2)} ج.م</span>
                     </div>
                     ${
                       data.payment_status === "paid" || paidAmount > 0
                         ? `<div class="total-row">
                              <span>المدفوع</span>
                              <span class="val">${paidAmount.toFixed(2)} ج.م</span>
                            </div>
                            ${
                              changeGiven > 0
                                ? `<div class="total-row">
                                     <span>الباقي</span>
                                     <span class="val">${changeGiven.toFixed(2)} ج.م</span>
                                   </div>`
                                : ""
                            }`
                         : ""
                     }
                   </div>
                   <div class="footer">
                     <div class="slogan">${escapeHtml(SHOP_SLOGAN)}</div>
                     <div>شكراً لزيارتكم</div>
                     <div class="bar address-bar">${escapeHtml(SHOP_ADDRESS)}</div>
                     <div class="brand">
                       <div>Powered by <span class="brand-company">${escapeHtml(DEV_COMPANY)}</span></div>
                       <div>${escapeHtml(DEV_NAME)} · ${escapeHtml(DEV_PHONE)}</div>
                     </div>
                   </div>`
            }
          </div>
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
      resolve();
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

    const finish = () => {
      cleanup();
      resolve();
    };

    const triggerPrint = () => {
      frameWindow.focus();
      frameWindow.print();
      frameWindow.addEventListener("afterprint", finish, { once: true });
      setTimeout(finish, 5000);
    };

    if (frameDoc.readyState === "complete") {
      requestAnimationFrame(triggerPrint);
    } else {
      iframe.onload = () => requestAnimationFrame(triggerPrint);
    }
  });

export const printInvoiceCopies = async (data: InvoiceData) => {
  await printInvoice(data, false);
  await printInvoice(data, true);
};
