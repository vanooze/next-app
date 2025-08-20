"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.personMatches = exports.resolveTaskPeople = void 0;
const mappings_1 = require("../constants/mappings");
const normalize_1 = require("./normalize");
const SBOQ_MAP_NORM = Object.fromEntries(Object.entries(mappings_1.SBOQ_MAP).map(([k, v]) => [(0, normalize_1.normCode)(k), v]));
const EBOQ_MAP_NORM = Object.fromEntries(Object.entries(mappings_1.EBOQ_MAP).map(([k, v]) => [(0, normalize_1.normCode)(k), v]));
function resolveTaskPeople(task) {
    const people = [];
    const hasEboq = !!String(task?.systemDiagram ?? "").trim();
    const hasEboqDate = !!task?.eBoqDate;
    const hasSboq = !!String(task?.structuralBoq ?? "").trim();
    const hasSboqDate = !!task?.sBoqDate;
    const hasSirME = !!task?.sirME;
    if (hasEboq && hasEboqDate) {
        people.push(...(0, normalize_1.splitCodes)(task.systemDiagram)
            .map((code) => EBOQ_MAP_NORM[(0, normalize_1.normCode)(code)] ?? SBOQ_MAP_NORM[(0, normalize_1.normCode)(code)])
            .filter(Boolean));
    }
    if (hasEboq && hasEboqDate && hasSboq && hasSboqDate) {
        people.push(...(0, normalize_1.splitCodes)(task.structuralBoq)
            .map((code) => SBOQ_MAP_NORM[(0, normalize_1.normCode)(code)] ?? EBOQ_MAP_NORM[(0, normalize_1.normCode)(code)])
            .filter(Boolean));
    }
    if (hasEboq && hasEboqDate && hasSboq && hasSboqDate && hasSirME) {
        people.push(mappings_1.SIR_ME);
    }
    return people;
}
exports.resolveTaskPeople = resolveTaskPeople;
function personMatches(resolved, target) {
    if (!target)
        return true;
    return resolved.some((p) => (0, normalize_1.normNoSpace)(p) === (0, normalize_1.normNoSpace)(target));
}
exports.personMatches = personMatches;
