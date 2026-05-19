import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByPet = query({
  args: { petId: v.id("pets") },
  handler: async (ctx, { petId }) => {
    return await ctx.db
      .query("weights")
      .withIndex("by_pet", (q) => q.eq("petId", petId))
      .collect();
  },
});

export const listForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("weights")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    petId: v.id("pets"),
    weight: v.string(),
    date: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("weights", args);
  },
});

export const remove = mutation({
  args: { id: v.id("weights") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
