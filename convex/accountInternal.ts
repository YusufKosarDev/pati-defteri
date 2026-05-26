import { v } from "convex/values";
import { internalMutation, internalQuery, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { checkRateLimit } from "./rateLimit";

/** Action'lar ctx.db'ye erişemez; kullanıcının e-posta/anonim bilgisini buradan alır. */
export const getAuthInfo = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return { email: user.email ?? null, isAnonymous: user.isAnonymous ?? false };
  },
});

/** Hassas işlemler için rate limit (brute-force'a karşı). */
export const rateLimit = internalMutation({
  args: { userId: v.id("users"), key: v.string(), max: v.number(), windowMs: v.number() },
  handler: async (ctx, { userId, key, max, windowMs }) => {
    await checkRateLimit(ctx, userId, key, max, windowMs);
  },
});

/** Verilen e-posta başka bir kullanıcıda kayıtlı mı? (misafir yükseltmede çakışma kontrolü) */
export const emailTaken = internalQuery({
  args: { email: v.string(), exceptUserId: v.id("users") },
  handler: async (ctx, { email, exceptUserId }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .collect();
    return existing.some((u) => u._id !== exceptUserId);
  },
});

async function deleteAppData(ctx: MutationCtx, userId: Id<"users">): Promise<void> {
  const pets = await ctx.db
    .query("pets")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  for (const p of pets) {
    if (p.photoStorageId) {
      try {
        await ctx.storage.delete(p.photoStorageId);
      } catch {
        // storage zaten silinmiş olabilir; yoksay
      }
    }
  }

  const records = await ctx.db
    .query("records")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  for (const r of records) await ctx.db.delete(r._id);

  const weights = await ctx.db
    .query("weights")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  for (const w of weights) await ctx.db.delete(w._id);

  const subs = await ctx.db
    .query("pushSubscriptions")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  for (const s of subs) await ctx.db.delete(s._id);

  const limits = await ctx.db
    .query("rateLimits")
    .withIndex("by_user_key", (q) => q.eq("userId", userId))
    .collect();
  for (const l of limits) await ctx.db.delete(l._id);

  for (const p of pets) await ctx.db.delete(p._id);
}

async function deleteAuthAccounts(ctx: MutationCtx, userId: Id<"users">): Promise<void> {
  const accounts = await ctx.db
    .query("authAccounts")
    .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
    .collect();
  for (const a of accounts) await ctx.db.delete(a._id);
}

/** Kullanıcının tüm app verisini + auth hesaplarını + user dokümanını siler. */
export const purgeUser = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await deleteAppData(ctx, userId);
    await deleteAuthAccounts(ctx, userId);
    await ctx.db.delete(userId);
  },
});

/** Misafir yükseltme: app verisini eski→yeni kullanıcıya taşır, eski anonim kullanıcıyı temizler. */
export const migrateAndPurgeOldUser = internalMutation({
  args: { fromUserId: v.id("users"), toUserId: v.id("users") },
  handler: async (ctx, { fromUserId, toUserId }) => {
    const pets = await ctx.db
      .query("pets")
      .withIndex("by_user", (q) => q.eq("userId", fromUserId))
      .collect();
    for (const p of pets) await ctx.db.patch(p._id, { userId: toUserId });

    const records = await ctx.db
      .query("records")
      .withIndex("by_user", (q) => q.eq("userId", fromUserId))
      .collect();
    for (const r of records) await ctx.db.patch(r._id, { userId: toUserId });

    const weights = await ctx.db
      .query("weights")
      .withIndex("by_user", (q) => q.eq("userId", fromUserId))
      .collect();
    for (const w of weights) await ctx.db.patch(w._id, { userId: toUserId });

    const subs = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", fromUserId))
      .collect();
    for (const s of subs) await ctx.db.patch(s._id, { userId: toUserId });

    // Eski kullanıcının rate limit sayaçları taşınmaz, silinir.
    const limits = await ctx.db
      .query("rateLimits")
      .withIndex("by_user_key", (q) => q.eq("userId", fromUserId))
      .collect();
    for (const l of limits) await ctx.db.delete(l._id);

    await deleteAuthAccounts(ctx, fromUserId);
    await ctx.db.delete(fromUserId);
  },
});
