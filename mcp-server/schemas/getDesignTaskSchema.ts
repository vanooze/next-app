import { z } from "zod";
import { FRIENDLY_CANON } from "../constants/mappings";
import { STATUSES } from "../constants/statuses";

export const getDesignTaskSchemaShape = {
  status: z.string().transform((val) => {
    const normalized = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
    if (!(STATUSES as readonly string[]).includes(normalized)) {
      throw new Error(
        `Invalid status "${val}". Allowed: ${STATUSES.join(", ")}`
      );
    }
    return normalized as (typeof STATUSES)[number];
  }),
  person: z.string().transform((val) => {
    const canon =
      FRIENDLY_CANON[val.trim().toLowerCase() as keyof typeof FRIENDLY_CANON];
    if (!canon) {
      throw new Error(
        `Invalid person "${val}". Allowed: ${Object.values(FRIENDLY_CANON).join(
          ", "
        )}`
      );
    }
    return canon;
  }),
  details: z.boolean().optional().default(false),
  debug: z.boolean().optional().default(false),
  trace: z.boolean().optional().default(false),
};
export const getDesignTaskSchema = z.object(getDesignTaskSchemaShape);

export type GetDesignTaskArgs = z.infer<typeof getDesignTaskSchema>;
