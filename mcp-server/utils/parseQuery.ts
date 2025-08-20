import { STATUSES } from "../constants/statuses";
import { FRIENDLY_CANON } from "../constants/mappings";

export function parseQuery(input: string) {
  if (!input) return null;

  const lower = input.toLowerCase();

  // 1. Detect status
  const status = STATUSES.find((s) => lower.includes(s.toLowerCase()));

  // 2. Detect person
  const person = Object.values(FRIENDLY_CANON).find((p) =>
    lower.includes(p.toLowerCase())
  );

  // 3. Detect if details requested
  const details = /details|full|all/i.test(lower);

  return { status, person, details };
}
