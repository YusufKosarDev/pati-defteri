import { internalQuery } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

function daysUntil(dateStr: string | undefined | null): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export const collectReminders = internalQuery({
  args: {},
  handler: async (ctx) => {
    const subs = await ctx.db.query("pushSubscriptions").collect();
    const byUser = new Map();
    for (const s of subs) {
      if (!byUser.has(s.userId)) byUser.set(s.userId, []);
      byUser.get(s.userId).push(s);
    }

    const result = [];
    for (const [userId, userSubs] of byUser.entries()) {
      const records = await ctx.db
        .query("records")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      const overdue = [];
      const upcoming = [];
      for (const r of records) {
        if (!r.nextDate) continue;
        const d = daysUntil(r.nextDate);
        if (d === null) continue;
        if (d < 0) overdue.push({ record: r, days: -d });
        else if (d <= 7) upcoming.push({ record: r, days: d });
      }

      if (overdue.length === 0 && upcoming.length === 0) continue;

      const pets = await ctx.db
        .query("pets")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      const petName = (petId: Id<"pets">) =>
        pets.find((p: Doc<"pets">) => p._id === petId)?.name ?? "Bilinmeyen";

      const lines = [];
      if (overdue.length > 0) {
        lines.push(
          `⚠️ ${overdue.length} gecikmiş: ` +
            overdue
              .slice(0, 3)
              .map(({ record, days }) => `${petName(record.petId)} ${record.type} (${days}g)`)
              .join(", ")
        );
      }
      if (upcoming.length > 0) {
        lines.push(
          `⏰ ${upcoming.length} yaklaşan: ` +
            upcoming
              .slice(0, 3)
              .map(({ record, days }) =>
                `${petName(record.petId)} ${record.type} (${days === 0 ? "bugün" : `${days}g`})`
              )
              .join(", ")
        );
      }

      result.push({
        userId,
        subscriptions: userSubs,
        title: "🐾 PatiDefteri hatırlatıcı",
        body: lines.join("  ·  "),
      });
    }
    return result;
  },
});
