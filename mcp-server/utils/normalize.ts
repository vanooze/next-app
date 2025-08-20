export const normNoSpace = (v: unknown) =>
  String(v ?? "")
    .replace(/\s+/g, "")
    .toLowerCase();

export const normCode = (v: unknown) =>
  String(v ?? "")
    .replace(/\s+/g, "")
    .toUpperCase();

export const splitCodes = (field: unknown): string[] =>
  String(field ?? "")
    .split(/[,/&|;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(normCode);

export const statusMatches = (a: unknown, b: unknown) =>
  normNoSpace(a) === normNoSpace(b);
