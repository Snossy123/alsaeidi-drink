export type InvoiceStatus = "completed" | "void" | "refunded" | "partial_refund";
export type PaymentStatus = "paid" | "unpaid" | "partial";
export type PaymentMethod = "cash" | "card" | "mixed";

export interface SaleInvoiceItem {
  id?: string | number;
  product_id?: string | number;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
}

export interface SaleInvoice {
  id: string | number;
  invoiceNumber: string;
  date: string;
  time: string;
  items: SaleInvoiceItem[];
  total: number;
  cashier?: string;
  status?: InvoiceStatus;
  payment_status?: PaymentStatus;
  payment_method?: PaymentMethod;
  amount_paid?: number;
  change_given?: number;
  refund_amount?: number;
  kitchen_note?: string;
}
