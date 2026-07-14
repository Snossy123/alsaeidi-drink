export type InvoiceStatus = "completed" | "void" | "refunded" | "partial_refund";
export type PaymentStatus = "paid" | "unpaid" | "partial";
export type PaymentMethod = "cash" | "card" | "mixed";
export type OrderType = "takeaway" | "table";

export interface SaleInvoiceItem {
  id?: string | number;
  product_id?: string | number;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
  size?: string | null;
  modifiers?: { id?: number; name: string; price?: number }[];
}

export interface SaleInvoice {
  id: string | number;
  invoiceNumber: string;
  date: string;
  time: string;
  items: SaleInvoiceItem[];
  total: number;
  employee_id?: string | number;
  cashier?: string;
  status?: InvoiceStatus;
  payment_status?: PaymentStatus;
  payment_method?: PaymentMethod;
  order_type?: OrderType;
  amount_paid?: number;
  change_given?: number;
  refund_amount?: number;
  kitchen_note?: string;
}

export const orderTypeLabels: Record<OrderType, string> = {
  takeaway: "تيك اوي",
  table: "طربيزة",
};
