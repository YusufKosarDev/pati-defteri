import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { internal } from "./_generated/api";

const modules = import.meta.glob("./**/*.ts");

/**
 * collectReminders bucket'ları yapar: yalnızca push aboneliği olan kullanıcılar
 * için gecikmiş/yaklaşan kayıtlardan paylaşılan bir bildirim metni kurar.
 * Bu test gün hesabı + bucket mantığını kilitler.
 */
describe("collectReminders", () => {
  it("push aboneliği olmayan kullanıcı için bucket üretmez", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) => ctx.db.insert("users", { name: "Alice" }));
    const petId = await t.run((ctx) =>
      ctx.db.insert("pets", { userId, name: "Mırnav", type: "cat" })
    );
    // Gecikmiş bir kayıt var ama abonelik yok
    await t.run((ctx) =>
      ctx.db.insert("records", {
        userId, petId, type: "mixed_vaccine", date: "2020-01-01", nextDate: "2020-06-01",
      })
    );

    const buckets = await t.query(internal.remindersInternal.collectReminders, {});
    expect(buckets).toEqual([]);
  });

  it("gecikmiş + yaklaşan kayıtları birleştirir", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) => ctx.db.insert("users", { name: "Alice" }));
    const petId = await t.run((ctx) =>
      ctx.db.insert("pets", { userId, name: "Mırnav", type: "cat" })
    );

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const inThreeDays = new Date(today);
    inThreeDays.setDate(today.getDate() + 3);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    // Gecikmiş kayıt
    await t.run((ctx) =>
      ctx.db.insert("records", {
        userId, petId, type: "rabies", date: "2024-01-01", nextDate: fmt(yesterday),
      })
    );
    // Yaklaşan kayıt
    await t.run((ctx) =>
      ctx.db.insert("records", {
        userId, petId, type: "flea", date: "2024-01-01", nextDate: fmt(inThreeDays),
      })
    );
    // Abonelik
    await t.run((ctx) =>
      ctx.db.insert("pushSubscriptions", {
        userId,
        endpoint: "https://example.com/x",
        keys: { p256dh: "p", auth: "a" },
        createdAt: Date.now(),
      })
    );

    const buckets = await t.query(internal.remindersInternal.collectReminders, {});
    expect(buckets).toHaveLength(1);
    const b = buckets[0];
    expect(b.subscriptions).toHaveLength(1);
    // Hem gecikmiş hem yaklaşan ifadeleri body'de var
    expect(b.body).toMatch(/gecikmiş/);
    expect(b.body).toMatch(/yaklaşan/);
    // Anahtar değil etiket görünmeli (TR backend etiketi)
    expect(b.body).toMatch(/Kuduz Aşısı/);
    expect(b.body).toMatch(/Pire İlacı/);
  });

  it("ne gecikmiş ne yaklaşan kayıt varsa bucket üretmez", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) => ctx.db.insert("users", { name: "Alice" }));
    await t.run((ctx) =>
      ctx.db.insert("pushSubscriptions", {
        userId,
        endpoint: "https://example.com/y",
        keys: { p256dh: "p", auth: "a" },
        createdAt: Date.now(),
      })
    );

    const buckets = await t.query(internal.remindersInternal.collectReminders, {});
    expect(buckets).toEqual([]);
  });
});

describe("prepareReminder (e-posta)", () => {
  it("e-postasız hesap için hata fırlatır", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) => ctx.db.insert("users", { name: "Alice" }));

    await expect(
      t.mutation(internal.emailInternal.prepareReminder, { userId })
    ).rejects.toThrow(/e-posta/i);
  });

  it("yaklaşan/gecikmiş yoksa hata fırlatır", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) =>
      ctx.db.insert("users", { name: "Alice", email: "a@b.c" })
    );

    await expect(
      t.mutation(internal.emailInternal.prepareReminder, { userId })
    ).rejects.toThrow(/Gönderilecek hatırlatıcı yok/);
  });

  it("hatırlatıcı listesi etiketleri TR olarak içerir", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) =>
      ctx.db.insert("users", { name: "Alice", email: "a@b.c" })
    );
    const petId = await t.run((ctx) =>
      ctx.db.insert("pets", { userId, name: "Mırnav", type: "cat" })
    );
    const inTwoDays = new Date();
    inTwoDays.setDate(inTwoDays.getDate() + 2);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    await t.run((ctx) =>
      ctx.db.insert("records", {
        userId, petId, type: "vet_visit", date: "2024-01-01", nextDate: fmt(inTwoDays),
      })
    );

    const result = await t.mutation(internal.emailInternal.prepareReminder, { userId });
    expect(result.to).toBe("a@b.c");
    expect(result.reminderList).toMatch(/Veteriner Ziyareti/);
    expect(result.reminderList).toMatch(/Mırnav/);
  });
});
