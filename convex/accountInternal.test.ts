import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { internal } from "./_generated/api";

const modules = import.meta.glob("./**/*.ts");

async function seedUser(t: ReturnType<typeof convexTest>, name: string, email?: string) {
  return await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", { name, email });
    const petId = await ctx.db.insert("pets", { userId, name: `${name}-pet`, type: "Kedi" });
    await ctx.db.insert("records", { userId, petId, type: "Karma Aşı", date: "2026-01-01" });
    await ctx.db.insert("weights", { userId, petId, weight: "4.0", date: "2026-01-01" });
    await ctx.db.insert("pushSubscriptions", {
      userId,
      endpoint: `https://push/${name}`,
      keys: { p256dh: "p", auth: "a" },
      createdAt: Date.now(),
    });
    await ctx.db.insert("rateLimits", { userId, key: "pets.create", count: 1, windowStart: Date.now() });
    await ctx.db.insert("authAccounts", {
      userId,
      provider: "password",
      providerAccountId: email ?? name,
    });
    return { userId, petId };
  });
}

async function countFor(t: ReturnType<typeof convexTest>, userId: string) {
  return await t.run(async (ctx) => {
    const tableNames = ["pets", "records", "weights", "pushSubscriptions", "rateLimits", "authAccounts"] as const;
    const counts: Record<string, number> = {};
    for (const name of tableNames) {
      const all = await ctx.db.query(name).collect();
      counts[name] = all.filter((r) => (r as { userId?: string }).userId === userId).length;
    }
    counts.user = (await ctx.db.get(userId as never)) ? 1 : 0;
    return counts;
  });
}

describe("accountInternal.purgeUser", () => {
  it("kullanıcının tüm verisini ve auth hesabını siler, başkasınınkine dokunmaz", async () => {
    const t = convexTest(schema, modules);
    const { userId: aliceId } = await seedUser(t, "Alice", "alice@x.com");
    const { userId: bobId } = await seedUser(t, "Bob", "bob@x.com");

    await t.mutation(internal.accountInternal.purgeUser, { userId: aliceId });

    const alice = await countFor(t, aliceId);
    expect(alice).toEqual({ pets: 0, records: 0, weights: 0, pushSubscriptions: 0, rateLimits: 0, authAccounts: 0, user: 0 });

    const bob = await countFor(t, bobId);
    expect(bob).toEqual({ pets: 1, records: 1, weights: 1, pushSubscriptions: 1, rateLimits: 1, authAccounts: 1, user: 1 });
  });
});

describe("accountInternal.migrateAndPurgeOldUser", () => {
  it("misafir verisini yeni kullanıcıya taşır, eski kullanıcıyı temizler", async () => {
    const t = convexTest(schema, modules);
    const { userId: guestId } = await seedUser(t, "Guest");
    const newUserId = await t.run((ctx) =>
      ctx.db.insert("users", { name: "Yeni", email: "yeni@x.com" })
    );

    await t.mutation(internal.accountInternal.migrateAndPurgeOldUser, {
      fromUserId: guestId,
      toUserId: newUserId,
    });

    const guest = await countFor(t, guestId);
    // Veri yeni kullanıcıya taşındı, eski auth hesabı + user silindi.
    expect(guest).toEqual({ pets: 0, records: 0, weights: 0, pushSubscriptions: 0, rateLimits: 0, authAccounts: 0, user: 0 });

    const moved = await countFor(t, newUserId);
    expect(moved.pets).toBe(1);
    expect(moved.records).toBe(1);
    expect(moved.weights).toBe(1);
    expect(moved.pushSubscriptions).toBe(1);
    expect(moved.user).toBe(1);
  });
});

describe("accountInternal.emailTaken", () => {
  it("başka kullanıcıda kayıtlı e-postayı yakalar, kendini hariç tutar", async () => {
    const t = convexTest(schema, modules);
    const aliceId = await t.run((ctx) => ctx.db.insert("users", { name: "Alice", email: "a@x.com" }));
    const bobId = await t.run((ctx) => ctx.db.insert("users", { name: "Bob", email: "b@x.com" }));

    expect(await t.query(internal.accountInternal.emailTaken, { email: "a@x.com", exceptUserId: bobId })).toBe(true);
    expect(await t.query(internal.accountInternal.emailTaken, { email: "a@x.com", exceptUserId: aliceId })).toBe(false);
    expect(await t.query(internal.accountInternal.emailTaken, { email: "yok@x.com", exceptUserId: bobId })).toBe(false);
  });
});
