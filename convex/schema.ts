import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { vetObject } from "./lib/vetArg";

export default defineSchema({
  ...authTables,

  pets: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: v.string(),
    breed: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    photo: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
    notes: v.optional(v.string()),
    vets: v.optional(v.array(vetObject)),
  }).index("by_user", ["userId"]),

  records: defineTable({
    userId: v.id("users"),
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
    userId: v.id("users"),
    petId: v.id("pets"),
    weight: v.string(),
    date: v.string(),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_pet", ["petId"]),

  pushSubscriptions: defineTable({
    userId: v.id("users"),
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_endpoint", ["endpoint"]),

  // Kullanıcı başına işlem sayacı — bkz. convex/rateLimit.ts
  rateLimits: defineTable({
    userId: v.id("users"),
    key: v.string(),
    count: v.number(),
    windowStart: v.number(),
  }).index("by_user_key", ["userId", "key"]),
});
