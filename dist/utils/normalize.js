"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusMatches = exports.splitCodes = exports.normCode = exports.normNoSpace = void 0;
const normNoSpace = (v) => String(v ?? "")
    .replace(/\s+/g, "")
    .toLowerCase();
exports.normNoSpace = normNoSpace;
const normCode = (v) => String(v ?? "")
    .replace(/\s+/g, "")
    .toUpperCase();
exports.normCode = normCode;
const splitCodes = (field) => String(field ?? "")
    .split(/[,/&|;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(exports.normCode);
exports.splitCodes = splitCodes;
const statusMatches = (a, b) => (0, exports.normNoSpace)(a) === (0, exports.normNoSpace)(b);
exports.statusMatches = statusMatches;
