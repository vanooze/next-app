export function displayValue(value: string | number | null | undefined) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "null"
  ) {
    return "-";
  }
  return String(value).toUpperCase();
}
