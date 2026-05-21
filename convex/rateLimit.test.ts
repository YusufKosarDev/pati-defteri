import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";

const modules = import.meta.glob("./**/*.ts");

describe("rate limit — backup.replaceAll", () => {
  it("5. çağrıya kadar geçer, 6.'yı reddeder", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) => ctx.db.insert("users", { name: "Alice" }));
    const auth = t.withIdentity({ subject: userId });
    const empty = { pets: [], records: [], weights: [] };

    // 5 çağrı izinli
    for (let i = 0; i < 5; i++) {
      await auth.mutation(api.backup.replaceAll, empty);
    }

    // 6. çağrı limit hatası vermeli
    await expect(auth.mutation(api.backup.replaceAll, empty)).rejects.toThrow(/Çok fazla istek/);
  });

  it("farklı kullanıcılar birbirinden bağımsız sayılır", async () => {
    const t = convexTest(schema, modules);
    const aliceId = await t.run((ctx) => ctx.db.insert("users", { name: "Alice" }));
    const bobId = await t.run((ctx) => ctx.db.insert("users", { name: "Bob" }));
    const empty = { pets: [], records: [], weights: [] };

    // Alice limiti tüketsin
    for (let i = 0; i < 5; i++) {
      await t.withIdentity({ subject: aliceId }).mutation(api.backup.replaceAll, empty);
    }
    await expect(
      t.withIdentity({ subject: aliceId }).mutation(api.backup.replaceAll, empty)
    ).rejects.toThrow(/Çok fazla istek/);

    // Bob hâlâ çağırabilir
    await expect(
      t.withIdentity({ subject: bobId }).mutation(api.backup.replaceAll, empty)
    ).resolves.toBeDefined();
  });
});

describe("rate limit — pets.create", () => {
  it("30. çağrıya kadar geçer, 31.'i reddeder", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) => ctx.db.insert("users", { name: "Alice" }));
    const auth = t.withIdentity({ subject: userId });

    for (let i = 0; i < 30; i++) {
      await auth.mutation(api.pets.create, { name: `Pet ${i}`, type: "Kedi" });
    }

    await expect(
      auth.mutation(api.pets.create, { name: "Pet 31", type: "Kedi" })
    ).rejects.toThrow(/Çok fazla istek/);
  });
});
