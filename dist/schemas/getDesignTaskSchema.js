"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDesignTaskSchema = exports.getDesignTaskSchemaShape = void 0;
const zod_1 = require("zod");
const mappings_1 = require("../constants/mappings");
const statuses_1 = require("../constants/statuses");
exports.getDesignTaskSchemaShape = {
    status: zod_1.z.string().transform((val) => {
        const normalized = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
        if (!statuses_1.STATUSES.includes(normalized)) {
            throw new Error(`Invalid status "${val}". Allowed: ${statuses_1.STATUSES.join(", ")}`);
        }
        return normalized;
    }),
    person: zod_1.z.string().transform((val) => {
        const canon = mappings_1.FRIENDLY_CANON[val.trim().toLowerCase()];
        if (!canon) {
            throw new Error(`Invalid person "${val}". Allowed: ${Object.values(mappings_1.FRIENDLY_CANON).join(", ")}`);
        }
        return canon;
    }),
    details: zod_1.z.boolean().optional().default(false),
    debug: zod_1.z.boolean().optional().default(false),
    trace: zod_1.z.boolean().optional().default(false),
};
exports.getDesignTaskSchema = zod_1.z.object(exports.getDesignTaskSchemaShape);
