import { CalendarDate } from "@internationalized/date";

// Converts various formats to YYYY-MM-DD
export function normalizeToYYYYMMDD(
  dateInput: string | number | null | undefined
): string | null {
  if (!dateInput) return null;

  if (typeof dateInput === "number") {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0]; // yyyy-mm-dd
  }

  if (typeof dateInput === "string") {
    // Already in YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      return dateInput;
    }

    // Handle MM/DD/YYYY or MM-DD-YYYY
    let match = dateInput.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (match) {
      const [_, mm, dd, yyyy] = match;
      return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }

    // Handle DD/MM/YYYY or DD-MM-YYYY
    match = dateInput.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (match) {
      const [_, dd, mm, yyyy] = match;
      return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }

    // Fallback: try native parsing
    const parsed = new Date(dateInput);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
  }

  return null;
}

// Display in MM/DD/YYYY (for UI)
export function formatDateMMDDYYYY(
  dateInput: string | number | null | undefined
): string {
  const normalized = normalizeToYYYYMMDD(dateInput);
  if (!normalized) return "-";

  const [yyyy, mm, dd] = normalized.split("-");
  return `${mm}/${dd}/${yyyy}`;
}

// Convert CalendarDate to YYYY-MM-DD
export const formatDatetoStr = (
  date: CalendarDate | null | undefined
): string | null => {
  if (!date) return null;

  const mm = String(date.month).padStart(2, "0");
  const dd = String(date.day).padStart(2, "0");
  const yyyy = date.year;

  return `${yyyy}-${mm}-${dd}`;
};
