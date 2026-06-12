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
