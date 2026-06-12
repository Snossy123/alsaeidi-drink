export function matchesDateRange(date: string, from: string, to: string) {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export function matchesTimeRange(time: string, from: string, to: string) {
  if (!from && !to) return true;
  const value = (time || "00:00:00").slice(0, 5);
  if (from && value < from) return false;
  if (to && value > to) return false;
  return true;
}

export function matchesAmountRange(total: number, min: string, max: string) {
  const minVal = min ? parseFloat(min) : null;
  const maxVal = max ? parseFloat(max) : null;
  if (minVal !== null && !Number.isNaN(minVal) && total < minVal) return false;
  if (maxVal !== null && !Number.isNaN(maxVal) && total > maxVal) return false;
  return true;
}
