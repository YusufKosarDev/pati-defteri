import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { checkRateLimit } from "./rateLimit";

function daysUntil(dateStr: string | undefined | null): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Hatırlatıcı e-postasının içeriğini SUNUCUDA, kullanıcının kendi verisinden
 * kurar. İçerik istemciden gelmez → HTML enjeksiyonu ve sahte alıcı mümkün değil.
 * Alıcı her zaman kullanıcının hesabına kayıtlı e-postadır.
 */
export const prepareReminder = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Spam'e karşı: kullanıcı başına dakikada max 3 hatırlatıcı maili
    await checkRateLimit(ctx, userId, "email.send", 3, 60_000);

    const user = await ctx.db.get(userId);
    const to = user?.email ?? null;
    if (!to) {
      throw new Error(
        "E-posta hatırlatıcısı için hesabınızda kayıtlı bir e-posta gerekir."
      );
    }

    const records = await ctx.db
      .query("records")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const pets = await ctx.db
      .query("pets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const petName = (petId: Id<"pets">) =>
      pets.find((p) => p._id === petId)?.name ?? "Bilinmeyen";

    const overdue: { type: string; petId: Id<"pets">; days: number }[] = [];
    const upcoming: { type: string; petId: Id<"pets">; days: number }[] = [];
    for (const r of records) {
      if (!r.nextDate) continue;
      const d = daysUntil(r.nextDate);
      if (d === null) continue;
      if (d < 0) overdue.push({ type: r.type, petId: r.petId, days: -d });
      else if (d <= 7) upcoming.push({ type: r.type, petId: r.petId, days: d });
    }

    if (overdue.length === 0 && upcoming.length === 0) {
      throw new Error("Gönderilecek hatırlatıcı yok.");
    }

    const lines: string[] = [];
    if (overdue.length > 0) {
      lines.push("⚠️ GECİKMİŞ BAKIMLAR:");
      for (const o of overdue) {
        lines.push(`• ${petName(o.petId)} — ${o.type} (${o.days} gün geçti)`);
      }
      lines.push("");
    }
    if (upcoming.length > 0) {
      lines.push("⏰ YAKLAŞAN BAKIMLAR (7 gün içinde):");
      for (const u of upcoming) {
        lines.push(
          `• ${petName(u.petId)} — ${u.type} (${u.days === 0 ? "bugün" : `${u.days} gün kaldı`})`
        );
      }
    }

    return {
      to,
      userName: user?.name ?? "Sevgili Kullanıcı",
      reminderList: lines.join("\n"),
    };
  },
});
