export type PurchaseInvoiceType = "general" | "operation";

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface InvoiceItem {
  product_name: string;
  barcode: string;
  quantity: number;
  purchase_price: number;
  sale_price: number;
  category: string;
}

export interface OperationExpenseItem {
  description: string;
  amount: number;
}

export interface PurchaseInvoice {
  id: string;
  invoice_number: string;
  supplier: string;
  invoice_type?: PurchaseInvoiceType;
  date: string;
  time: string;
  items: InvoiceItem[];
  total: number;
}

export const purchaseInvoiceTypeLabels: Record<PurchaseInvoiceType, string> = {
  general: "فاتورة عامة",
  operation: "فاتورة تشغيل",
};

export const getPurchaseInvoiceType = (invoice: PurchaseInvoice): PurchaseInvoiceType =>
  invoice.invoice_type ?? "general";
