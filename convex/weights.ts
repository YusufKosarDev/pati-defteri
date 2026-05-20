import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Oturum açık değil.");
  return userId;
}

async function requireOwnedWeight(ctx: MutationCtx, weightId: Id<"weights">) {
  const userId = await requireUser(ctx);
  const weight = await ctx.db.get(weightId);
  if (!weight || weight.userId !== userId) {
    throw new Error("Yetkisiz erişim.");
  }
  return userId;
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
      .query("weights")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    petId: v.id("pets"),
    weight: v.string(),
    date: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireOwnedPet(ctx, args.petId);
    return await ctx.db.insert("weights", { ...args, userId });
  },
});

export const remove = mutation({
  args: { id: v.id("weights") },
  handler: async (ctx, { id }) => {
    await requireOwnedWeight(ctx, id);
    await ctx.db.delete(id);
  },
});
