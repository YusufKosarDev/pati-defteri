import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const vetObject = v.object({
  clinicName: v.optional(v.string()),
  doctorName: v.optional(v.string()),
  phone: v.optional(v.string()),
  address: v.optional(v.string()),
  notes: v.optional(v.string()),
});

export default defineSchema({
  ...authTables,

  pets: defineTable({
    userId: v.string(),
    name: v.string(),
    type: v.string(),
    breed: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    photo: v.optional(v.string()),
    notes: v.optional(v.string()),
    vets: v.optional(v.array(vetObject)),
  }).index("by_user", ["userId"]),

  records: defineTable({
    userId: v.string(),
    petId: v.id("pets"),
    type: v.string(),
    date: v.string(),
    nextDate: v.optional(v.string()),
    notes: v.optional(v.string()),
    order: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_pet", ["petId"])
    .index("by_pet_nextDate", ["petId", "nextDate"]),

  weights: defineTable({
    userId: v.string(),
    petId: v.id("pets"),
    weight: v.string(),
    date: v.string(),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_pet", ["petId"]),
});
