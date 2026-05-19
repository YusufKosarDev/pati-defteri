import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByPet = query({
  args: { petId: v.id("pets") },
  handler: async (ctx, { petId }) => {
    return await ctx.db
      .query("records")
      .withIndex("by_pet", (q) => q.eq("petId", petId))
      .collect();
  },
});

export const listForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("records")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    petId: v.id("pets"),
    type: v.string(),
    date: v.string(),
    nextDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("records", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("records"),
    type: v.optional(v.string()),
    date: v.optional(v.string()),
    nextDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("records") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const reorder = mutation({
  args: {
    petId: v.id("pets"),
    orderedIds: v.array(v.id("records")),
  },
  handler: async (ctx, { orderedIds }) => {
    await Promise.all(
      orderedIds.map((id, index) => ctx.db.patch(id, { order: index }))
    );
  },
});
