import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { checkRateLimit } from "./rateLimit";
import { assertTextLimits } from "./validators";
import { requireUser, requireOwnedPet as requireOwnedPetFull } from "./lib/auth";

async function requireOwnedRecord(ctx: MutationCtx, recordId: Id<"records">) {
  const userId = await requireUser(ctx);
  const record = await ctx.db.get(recordId);
  if (!record || record.userId !== userId) {
    throw new Error("Yetkisiz erişim.");
  }
  return { userId, record };
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
    assertTextLimits(args);
    // Bot abuse'a karşı: kullanıcı başına dakikada max 60 kayıt
    await checkRateLimit(ctx, userId, "records.create", 60, 60_000);
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
    const { userId } = await requireOwnedRecord(ctx, id);
    assertTextLimits(patch);
    await checkRateLimit(ctx, userId, "records.update", 120, 60_000);
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("records") },
  handler: async (ctx, { id }) => {
    const { userId } = await requireOwnedRecord(ctx, id);
    await checkRateLimit(ctx, userId, "records.remove", 120, 60_000);
    await ctx.db.delete(id);
  },
});

// Tek bir hayvanın kayıt listesi yeniden sıralanır; gerçekçi üst sınırın çok
// üstünde bir tavan koyarak kötü niyetli devasa dizilerin N×(get+patch) yükü
// oluşturmasını engelliyoruz.
const MAX_REORDER_IDS = 1000;

export const reorder = mutation({
  args: { orderedIds: v.array(v.id("records")) },
  handler: async (ctx, { orderedIds }) => {
    const userId = await requireUser(ctx);
    if (orderedIds.length > MAX_REORDER_IDS) {
      throw new Error("Çok fazla kayıt; sıralama isteği reddedildi.");
    }
    // Sürükle-bırak sık tetiklenebilir; bot abuse'a karşı dakikada max 120 sıralama.
    await checkRateLimit(ctx, userId, "records.reorder", 120, 60_000);
    await Promise.all(
      orderedIds.map(async (id, index) => {
        const r = await ctx.db.get(id);
        if (!r || r.userId !== userId) return;
        await ctx.db.patch(id, { order: index });
      })
    );
  },
});
