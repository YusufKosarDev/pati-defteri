import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// NOTE: userId burada argüman olarak alınıyor. Step 2'de Convex Auth bağlanınca
// ctx.auth.getUserIdentity()'den okuyacak şekilde refactor edilecek.

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("pets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("pets") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    type: v.string(),
    breed: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    photo: v.optional(v.string()),
    notes: v.optional(v.string()),
    vets: v.optional(v.array(v.object({
      clinicName: v.optional(v.string()),
      doctorName: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      notes: v.optional(v.string()),
    }))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pets", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("pets"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    breed: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    photo: v.optional(v.string()),
    notes: v.optional(v.string()),
    vets: v.optional(v.array(v.object({
      clinicName: v.optional(v.string()),
      doctorName: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      notes: v.optional(v.string()),
    }))),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("pets") },
  handler: async (ctx, { id }) => {
    // Cascade: pete bağlı record + weight'leri de sil
    const records = await ctx.db
      .query("records")
      .withIndex("by_pet", (q) => q.eq("petId", id))
      .collect();
    for (const r of records) await ctx.db.delete(r._id);

    const weights = await ctx.db
      .query("weights")
      .withIndex("by_pet", (q) => q.eq("petId", id))
      .collect();
    for (const w of weights) await ctx.db.delete(w._id);

    await ctx.db.delete(id);
  },
});
