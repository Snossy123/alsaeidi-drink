import { APP_NAME } from "@/lib/branding";
import type { ShiftReportData } from "@/types/shift";

const fmt = (n: number | null | undefined) => Number(n ?? 0).toFixed(2);

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function printShiftReport(report: ShiftReportData) {
  const { shift, summary, invoices } = report;
  const employeeName = shift.employee?.name ?? `موظف #${shift.employee_id}`;

  const invoiceRows = invoices
    .map(
      (inv) => `
      <tr>
        <td>${escapeHtml(inv.invoice_number ?? `#${inv.id}`)}</td>
        <td>${escapeHtml(inv.date)} ${escapeHtml(inv.time ?? "")}</td>
        <td>${fmt(inv.total)}</td>
        <td>${fmt(inv.refund_amount)}</td>
        <td>${escapeHtml(inv.payment_method ?? "—")}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>تقرير وردية — ${escapeHtml(employeeName)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Tahoma, Arial, sans-serif; padding: 16px; color: #111; font-size: 13px; }
    h1 { font-size: 18px; margin-bottom: 4px; }
    .meta { color: #555; margin-bottom: 16px; font-size: 12px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 10px; }
    .card label { display: block; font-size: 10px; color: #666; margin-bottom: 2px; }
    .card strong { font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: right; }
    th { background: #f5f5f5; font-size: 11px; }
    h2 { font-size: 14px; margin: 16px 0 8px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(APP_NAME)} — تقرير وردية</h1>
  <div class="meta">
    الموظف: ${escapeHtml(employeeName)} |
    الافتتاح: ${escapeHtml(new Date(shift.opened_at).toLocaleString("ar-EG"))}
    ${shift.closed_at ? `| الإغلاق: ${escapeHtml(new Date(shift.closed_at).toLocaleString("ar-EG"))}` : ""}
  </div>

  <div class="grid">
    <div class="card"><label>صافي المبيعات</label><strong>${fmt(summary.net_sales)} ج</strong></div>
    <div class="card"><label>عدد الفواتير</label><strong>${summary.invoice_count}</strong></div>
    <div class="card"><label>فواتير ملغاة</label><strong>${summary.void_count}</strong></div>
    <div class="card"><label>رصيد الافتتاح</label><strong>${fmt(shift.opening_float)} ج</strong></div>
    <div class="card"><label>النقد المتوقع</label><strong>${fmt(summary.expected_cash)} ج</strong></div>
    <div class="card"><label>النقد الفعلي</label><strong>${fmt(summary.actual_cash)} ج</strong></div>
    <div class="card"><label>فرق النقد</label><strong>${fmt(summary.cash_difference)} ج</strong></div>
    <div class="card"><label>إجمالي المبيعات</label><strong>${fmt(summary.total_sales)} ج</strong></div>
    <div class="card"><label>المرتجعات</label><strong>${fmt(summary.total_refunds)} ج</strong></div>
  </div>

  <h2>فواتير الوردية (${invoices.length})</h2>
  <table>
    <thead>
      <tr>
        <th>رقم الفاتورة</th>
        <th>التاريخ</th>
        <th>الإجمالي</th>
        <th>مرتجع</th>
        <th>الدفع</th>
      </tr>
    </thead>
    <tbody>
      ${invoiceRows || '<tr><td colspan="5" style="text-align:center;color:#888">لا توجد فواتير</td></tr>'}
    </tbody>
  </table>
</body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(html);
  doc.close();

  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };
}
