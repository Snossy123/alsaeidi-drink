import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Shift } from "@/types/shift";

interface CloseShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift | null;
  onCloseShift: (actualCash: number, notes?: string) => Promise<void>;
}

export function CloseShiftDialog({ open, onOpenChange, shift, onCloseShift }: CloseShiftDialogProps) {
  const [actualCash, setActualCash] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCloseShift(parseFloat(actualCash) || 0, notes || undefined);
      onOpenChange(false);
      setActualCash("");
      setNotes("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-black text-xl">إغلاق الوردية</DialogTitle>
        </DialogHeader>
        {shift && (
          <div className="text-sm text-muted-foreground space-y-1 mb-2">
            <p>رصيد الافتتاح: {Number(shift.opening_float).toFixed(2)} ج</p>
            <p>بدأت: {new Date(shift.opened_at).toLocaleString("ar-EG")}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>النقد الفعلي في الدرج</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={actualCash}
              onChange={(e) => setActualCash(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>ملاحظات (اختياري)</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button type="submit" className="w-full font-black" disabled={submitting}>
            {submitting ? "جاري الإغلاق..." : "إغلاق الوردية"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
