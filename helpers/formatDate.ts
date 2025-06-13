import { CalendarDate } from "@internationalized/date"; 

export function formatDateMMDDYYYY(dateInput: string | number | null | undefined) {
  if (!dateInput) return "-";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";

  return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
    .getDate()
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
}

export function formatDatetoStr(date: CalendarDate | null): string | null {
  if (!date) return null;
  
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}