import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Sabit pencere (fixed-window) rate limiter. Production trafiği için
// @convex-dev/rate-limiter daha uygundur (sliding window + atomic counter),
// ama portfolyo trafik seviyesi için bu yaklaşım yeterli ve sıfır bağımlılık.

export async function checkRateLimit(
  ctx: MutationCtx,
  userId: Id<"users">,
  key: string,
  max: number,
  windowMs: number
): Promise<void> {
  const now = Date.now();
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_user_key", (q) => q.eq("userId", userId).eq("key", key))
    .first();

  if (!existing) {
    await ctx.db.insert("rateLimits", { userId, key, count: 1, windowStart: now });
    return;
  }

  // Pencere doldu → sıfırla
  if (now - existing.windowStart > windowMs) {
    await ctx.db.patch(existing._id, { count: 1, windowStart: now });
    return;
  }

  // Limit aşıldı → reddet
  if (existing.count >= max) {
    const retryInSec = Math.max(1, Math.ceil((existing.windowStart + windowMs - now) / 1000));
    throw new Error(
      `Çok fazla istek. Lütfen ${retryInSec} saniye sonra tekrar deneyin.`
    );
  }

  await ctx.db.patch(existing._id, { count: existing.count + 1 });
}
