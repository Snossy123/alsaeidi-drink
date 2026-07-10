const STORAGE_PREFIX = "sales-invoice-seq-";

const localYmd = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
};

/** Next daily sales invoice number for offline use: INV-YYYYMMDD-0001 */
export const nextLocalDailyInvoiceNumber = (date = new Date()): string => {
  const ymd = localYmd(date);
  const key = `${STORAGE_PREFIX}${ymd}`;
  const current = Number(localStorage.getItem(key) || "0");
  const next = Number.isFinite(current) ? current + 1 : 1;
  localStorage.setItem(key, String(next));
  return `INV-${ymd}-${String(next).padStart(4, "0")}`;
};

export const localDateString = (date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
