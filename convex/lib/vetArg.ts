// `schema.ts`, `pets.ts` ve `backup.ts` arasında paylaşılan veteriner validator.

import { v } from "convex/values";

export const vetObject = v.object({
  clinicName: v.optional(v.string()),
  doctorName: v.optional(v.string()),
  phone: v.optional(v.string()),
  address: v.optional(v.string()),
  notes: v.optional(v.string()),
});
