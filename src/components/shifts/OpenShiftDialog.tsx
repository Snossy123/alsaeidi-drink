import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface OpenShiftDialogProps {
  open: boolean;
  offline?: boolean;
  onOpenShift: (openingFloat: number, notes?: string) => Promise<void>;
}

export function OpenShiftDialog({ open, offline = false, onOpenShift }: OpenShiftDialogProps) {
  const [openingFloat, setOpeningFloat] = useState("0");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onOpenShift(parseFloat(openingFloat) || 0, notes || undefined);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md rounded-2xl" dir="rtl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-black text-xl">فتح وردية جديدة</DialogTitle>
        </DialogHeader>
        {offline && (
          <p className="text-sm text-amber-700 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            لا يمكن فتح وردية بدون إنترنت. اتصل بالشبكة ثم أعد المحاولة.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>رصيد الدرج الافتتاحي</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={openingFloat}
              onChange={(e) => setOpeningFloat(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>ملاحظات (اختياري)</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button type="submit" className="w-full font-black" disabled={submitting || offline}>
            {submitting ? "جاري الفتح..." : "فتح الوردية"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
