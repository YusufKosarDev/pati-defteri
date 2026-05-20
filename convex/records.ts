import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Oturum açık değil.");
  return userId;
}

async function requireOwnedRecord(ctx: MutationCtx, recordId: Id<"records">) {
  const userId = await requireUser(ctx);
  const record = await ctx.db.get(recordId);
  if (!record || record.userId !== userId) {
    throw new Error("Yetkisiz erişim.");
  }
  return { userId, record };
}

async function requireOwnedPet(ctx: MutationCtx, petId: Id<"pets">) {
  const userId = await requireUser(ctx);
  const pet = await ctx.db.get(petId);
  if (!pet || pet.userId !== userId) {
    throw new Error("Yetkisiz erişim.");
  }
  return userId;
}

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("records")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    petId: v.id("pets"),
    type: v.string(),
    date: v.string(),
    nextDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireOwnedPet(ctx, args.petId);
    return await ctx.db.insert("records", { ...args, userId });
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
    await requireOwnedRecord(ctx, id);
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("records") },
  handler: async (ctx, { id }) => {
    await requireOwnedRecord(ctx, id);
    await ctx.db.delete(id);
  },
});

export const reorder = mutation({
  args: { orderedIds: v.array(v.id("records")) },
  handler: async (ctx, { orderedIds }) => {
    const userId = await requireUser(ctx);
    await Promise.all(
      orderedIds.map(async (id, index) => {
        const r = await ctx.db.get(id);
        if (!r || r.userId !== userId) return;
        await ctx.db.patch(id, { order: index });
      })
    );
  },
});
