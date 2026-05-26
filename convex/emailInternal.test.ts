import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { internal } from "./_generated/api";

const modules = import.meta.glob("./**/*.ts");

function isoOffsetDays(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

describe("emailInternal.prepareReminder", () => {
  it("e-postası olmayan kullanıcıda hata verir", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) => ctx.db.insert("users", { name: "Misafir" }));
    await expect(
      t.mutation(internal.emailInternal.prepareReminder, { userId })
    ).rejects.toThrow(/e-posta/i);
  });

  it("gönderilecek hatırlatıcı yoksa hata verir", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) => ctx.db.insert("users", { name: "Ali", email: "ali@x.com" }));
    await t.run((ctx) =>
      ctx.db.insert("pets", { userId, name: "Mırnav", type: "Kedi" })
    );
    await expect(
      t.mutation(internal.emailInternal.prepareReminder, { userId })
    ).rejects.toThrow(/hatırlatıcı yok/i);
  });

  it("gecikmiş ve yaklaşan kayıtlardan listeyi kurar, hesap e-postasına gönderir", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) => ctx.db.insert("users", { name: "Ali", email: "ali@x.com" }));
    const petId = await t.run((ctx) =>
      ctx.db.insert("pets", { userId, name: "Mırnav", type: "Kedi" })
    );
    await t.run((ctx) =>
      ctx.db.insert("records", {
        userId, petId, type: "Karma Aşı", date: isoOffsetDays(-380), nextDate: isoOffsetDays(-5),
      })
    );
    await t.run((ctx) =>
      ctx.db.insert("records", {
        userId, petId, type: "Kuduz Aşısı", date: isoOffsetDays(-30), nextDate: isoOffsetDays(3),
      })
    );

    const result = await t.mutation(internal.emailInternal.prepareReminder, { userId });
    expect(result.to).toBe("ali@x.com");
    expect(result.reminderList).toContain("GECİKMİŞ");
    expect(result.reminderList).toContain("YAKLAŞAN");
    expect(result.reminderList).toContain("Mırnav");
  });
});
