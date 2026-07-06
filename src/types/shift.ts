export interface ShiftReportSummary {
  total_sales: number;
  total_refunds: number;
  net_sales: number;
  invoice_count: number;
  void_count: number;
  expected_cash?: number | null;
  actual_cash?: number | null;
  cash_difference?: number | null;
}

export interface ShiftReportInvoice {
  id: number;
  invoice_number?: string;
  date: string;
  time?: string;
  total: number;
  refund_amount?: number;
  payment_method?: string;
  payment_status?: string;
}

export interface ShiftReportData {
  shift: {
    id: number;
    employee_id: number;
    opened_at: string;
    closed_at?: string | null;
    opening_float: number;
    status: string;
    notes?: string | null;
    employee?: { id: number; name: string };
  };
  summary: ShiftReportSummary;
  invoices: ShiftReportInvoice[];
}

export interface Shift {
  id: number;
  employee_id: number;
  opened_at: string;
  closed_at?: string | null;
  opening_float: number;
  expected_cash?: number | null;
  actual_cash?: number | null;
  cash_difference?: number | null;
  status: "open" | "closed";
  notes?: string | null;
  employee?: {
    id: number;
    name: string;
  };
}
