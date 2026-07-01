import { createContext, useContext, useState, ReactNode } from "react";
import type { SaleInvoice } from "@/types/salesInvoice";

interface InvoiceEditContextValue {
  editingInvoice: SaleInvoice | null;
  startEditing: (invoice: SaleInvoice) => void;
  clearEditing: () => void;
}

const InvoiceEditContext = createContext<InvoiceEditContextValue | undefined>(undefined);

export function InvoiceEditProvider({ children }: { children: ReactNode }) {
  const [editingInvoice, setEditingInvoice] = useState<SaleInvoice | null>(null);

  const startEditing = (invoice: SaleInvoice) => setEditingInvoice(invoice);
  const clearEditing = () => setEditingInvoice(null);

  return (
    <InvoiceEditContext.Provider value={{ editingInvoice, startEditing, clearEditing }}>
      {children}
    </InvoiceEditContext.Provider>
  );
}

export function useInvoiceEdit() {
  const context = useContext(InvoiceEditContext);
  if (!context) {
    throw new Error("useInvoiceEdit must be used within InvoiceEditProvider");
  }
  return context;
}
