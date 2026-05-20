import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";

const modules = import.meta.glob("./**/*.ts");

describe("backup.replaceAll", () => {
  it("eski veriyi siler, yeni veriyi legacy id mapping ile aktarır", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) => ctx.db.insert("users", { name: "Alice" }));

    // Eski veri
    const oldPetId = await t.run((ctx) =>
      ctx.db.insert("pets", { userId, name: "Eski", type: "Kedi" })
    );
    await t.run((ctx) =>
      ctx.db.insert("records", {
        userId, petId: oldPetId, type: "Karma Aşı", date: "2025-01-01",
      })
    );

    const result = await t.withIdentity({ subject: userId }).mutation(api.backup.replaceAll, {
      pets: [
        { legacyId: "pet-1", name: "Yeni Mırnav", type: "Kedi" },
        { legacyId: "pet-2", name: "Yeni Karabaş", type: "Köpek" },
      ],
      records: [
        { legacyPetId: "pet-1", type: "Karma Aşı", date: "2026-05-01" },
        { legacyPetId: "pet-2", type: "Kuduz Aşısı", date: "2026-05-02" },
        { legacyPetId: "yok", type: "Bozuk", date: "2026-05-03" }, // bilinmeyen pet — atlanmalı
      ],
      weights: [
        { legacyPetId: "pet-1", weight: "4.2", date: "2026-05-01" },
      ],
    });

    expect(result.pets).toBe(2);
    expect(result.records).toBe(3); // bozuk olan dahil sayılır ama insert edilmez

    const allPets = await t.run((ctx) =>
      ctx.db.query("pets").withIndex("by_user", (q) => q.eq("userId", userId)).collect()
    );
    expect(allPets.map((p) => p.name).sort()).toEqual(["Yeni Karabaş", "Yeni Mırnav"]);

    const allRecords = await t.run((ctx) =>
      ctx.db.query("records").withIndex("by_user", (q) => q.eq("userId", userId)).collect()
    );
    // 3 girdiden 2'si geçerli pet'lere bağlanır, biri (legacyPetId: "yok") atlanır
    expect(allRecords).toHaveLength(2);
  });

  it("oturum yoksa replaceAll reddedilir", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.mutation(api.backup.replaceAll, { pets: [], records: [], weights: [] })
    ).rejects.toThrow(/Oturum açık değil/);
  });
});
