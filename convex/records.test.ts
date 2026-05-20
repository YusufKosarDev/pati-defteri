import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";

const modules = import.meta.glob("./**/*.ts");

describe("records mutations", () => {
  it("create record petId'nin sahipliğini doğrular", async () => {
    const t = convexTest(schema, modules);
    const aliceId = await t.run((ctx) => ctx.db.insert("users", { name: "Alice" }));
    const bobId = await t.run((ctx) => ctx.db.insert("users", { name: "Bob" }));

    const alicePetId = await t.run((ctx) =>
      ctx.db.insert("pets", { userId: aliceId, name: "Mırnav", type: "Kedi" })
    );

    // Bob, Alice'in pet'ine kayıt ekleyemez
    await expect(
      t.withIdentity({ subject: bobId }).mutation(api.records.create, {
        petId: alicePetId,
        type: "Karma Aşı",
        date: "2026-01-01",
      })
    ).rejects.toThrow(/Yetkisiz erişim/);

    // Alice ekleyebilir
    const recordId = await t
      .withIdentity({ subject: aliceId })
      .mutation(api.records.create, {
        petId: alicePetId,
        type: "Karma Aşı",
        date: "2026-01-01",
      });
    expect(recordId).toBeTruthy();
  });

  it("reorder sadece kendi kayıtlarını günceller, başkasınınkilere dokunmaz", async () => {
    const t = convexTest(schema, modules);
    const aliceId = await t.run((ctx) => ctx.db.insert("users", { name: "Alice" }));
    const bobId = await t.run((ctx) => ctx.db.insert("users", { name: "Bob" }));

    const alicePetId = await t.run((ctx) =>
      ctx.db.insert("pets", { userId: aliceId, name: "Mırnav", type: "Kedi" })
    );
    const bobPetId = await t.run((ctx) =>
      ctx.db.insert("pets", { userId: bobId, name: "Karabaş", type: "Köpek" })
    );

    const aliceRec = await t.run((ctx) =>
      ctx.db.insert("records", {
        userId: aliceId, petId: alicePetId, type: "Karma Aşı", date: "2026-01-01", order: 0,
      })
    );
    const bobRec = await t.run((ctx) =>
      ctx.db.insert("records", {
        userId: bobId, petId: bobPetId, type: "Karma Aşı", date: "2026-01-01", order: 0,
      })
    );

    // Alice, Bob'un kayıt id'sini de gönderse bile order'ı sadece kendisininki güncellenir
    await t
      .withIdentity({ subject: aliceId })
      .mutation(api.records.reorder, { orderedIds: [bobRec, aliceRec] });

    const aliceUpdated = await t.run((ctx) => ctx.db.get(aliceRec));
    const bobUntouched = await t.run((ctx) => ctx.db.get(bobRec));
    expect(aliceUpdated?.order).toBe(1); // index 1
    expect(bobUntouched?.order).toBe(0); // değişmedi
  });

  it("başkasının record'unu silemez", async () => {
    const t = convexTest(schema, modules);
    const aliceId = await t.run((ctx) => ctx.db.insert("users", { name: "Alice" }));
    const bobId = await t.run((ctx) => ctx.db.insert("users", { name: "Bob" }));

    const alicePetId = await t.run((ctx) =>
      ctx.db.insert("pets", { userId: aliceId, name: "Mırnav", type: "Kedi" })
    );
    const recordId = await t.run((ctx) =>
      ctx.db.insert("records", {
        userId: aliceId, petId: alicePetId, type: "Karma Aşı", date: "2026-01-01",
      })
    );

    await expect(
      t.withIdentity({ subject: bobId }).mutation(api.records.remove, { id: recordId })
    ).rejects.toThrow(/Yetkisiz erişim/);
  });
});
