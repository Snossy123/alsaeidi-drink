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

export interface PurchaseInvoice {
  id: string;
  invoice_number: string;
  supplier: string;
  date: string;
  time: string;
  items: InvoiceItem[];
  total: number;
}
