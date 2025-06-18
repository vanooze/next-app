import { CalendarDate } from "@internationalized/date"; 

export function formatDateMMDDYYYY(dateInput: string | number | null | undefined) {
  if (!dateInput) return "-";

  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, month, day] = dateInput.split("-");
    return `${month}/${day}/${year}`;
  }

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";

  return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
    .getDate()
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
}

export const formatDatetoStr = (date: CalendarDate | null | undefined): string | null => {
  if (!date) return null;
  
  const mm = String(date.month).padStart(2, "0");
  const dd = String(date.day).padStart(2, "0");
  const yyyy = date.year;

  return `${yyyy}-${mm}-${dd}`;
};