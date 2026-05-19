import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const upsertSubscription = internalMutation({
  args: {
    userId: v.id("users"),
    endpoint: v.string(),
    keys: v.object({ p256dh: v.string(), auth: v.string() }),
  },
  handler: async (ctx, { userId, endpoint, keys }) => {
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", endpoint))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { userId, keys });
      return;
    }
    await ctx.db.insert("pushSubscriptions", {
      userId,
      endpoint,
      keys,
      createdAt: Date.now(),
    });
  },
});

export const deleteSubscriptionByEndpoint = internalMutation({
  args: { userId: v.id("users"), endpoint: v.string() },
  handler: async (ctx, { userId, endpoint }) => {
    const sub = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", endpoint))
      .first();
    if (sub && sub.userId === userId) {
      await ctx.db.delete(sub._id);
    }
  },
});

export const listSubscriptionsForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const deleteSubscriptionById = internalMutation({
  args: { id: v.id("pushSubscriptions") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
