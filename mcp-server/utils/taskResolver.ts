import { SIR_ME, SBOQ_MAP, EBOQ_MAP } from "../constants/mappings";
import { normCode, normNoSpace, splitCodes } from "./normalize";

const SBOQ_MAP_NORM: Record<string, string> = Object.fromEntries(
  Object.entries(SBOQ_MAP).map(([k, v]) => [normCode(k), v])
);
const EBOQ_MAP_NORM: Record<string, string> = Object.fromEntries(
  Object.entries(EBOQ_MAP).map(([k, v]) => [normCode(k), v])
);

export function resolveTaskPeople(task: any): string[] {
  const people: string[] = [];

  const hasEboq = !!String(task?.systemDiagram ?? "").trim();
  const hasEboqDate = !!task?.eBoqDate;
  const hasSboq = !!String(task?.structuralBoq ?? "").trim();
  const hasSboqDate = !!task?.sBoqDate;
  const hasSirME = !!task?.sirME;

  if (hasEboq && hasEboqDate) {
    people.push(
      ...splitCodes(task.systemDiagram)
        .map(
          (code) =>
            EBOQ_MAP_NORM[normCode(code)] ?? SBOQ_MAP_NORM[normCode(code)]
        )
        .filter(Boolean)
    );
  }

  if (hasEboq && hasEboqDate && hasSboq && hasSboqDate) {
    people.push(
      ...splitCodes(task.structuralBoq)
        .map(
          (code) =>
            SBOQ_MAP_NORM[normCode(code)] ?? EBOQ_MAP_NORM[normCode(code)]
        )
        .filter(Boolean)
    );
  }

  if (hasEboq && hasEboqDate && hasSboq && hasSboqDate && hasSirME) {
    people.push(SIR_ME);
  }

  return people;
}

export function personMatches(resolved: string[], target: string): boolean {
  if (!target) return true;
  return resolved.some((p) => normNoSpace(p) === normNoSpace(target));
}
