import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { checkRateLimit } from "./rateLimit";
import { assertTextLimits } from "./validators";
import { requireUser, requireOwnedPet as requireOwnedPetFull } from "./lib/auth";

async function requireOwnedWeight(ctx: MutationCtx, weightId: Id<"weights">) {
  const userId = await requireUser(ctx);
  const weight = await ctx.db.get(weightId);
  if (!weight || weight.userId !== userId) {
    throw new Error("Yetkisiz erişim.");
  }
  return userId;
}

async function requireOwnedPet(ctx: MutationCtx, petId: Id<"pets">): Promise<Id<"users">> {
  const { userId } = await requireOwnedPetFull(ctx, petId);
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
    assertTextLimits(args);
    // Bot abuse'a karşı: kullanıcı başına dakikada max 60 ağırlık kaydı
    await checkRateLimit(ctx, userId, "weights.create", 60, 60_000);
    return await ctx.db.insert("weights", { ...args, userId });
  },
});

export const remove = mutation({
  args: { id: v.id("weights") },
  handler: async (ctx, { id }) => {
    const userId = await requireOwnedWeight(ctx, id);
    await checkRateLimit(ctx, userId, "weights.remove", 120, 60_000);
    await ctx.db.delete(id);
  },
});
