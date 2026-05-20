import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";

const modules = import.meta.glob("./**/*.ts");

describe("pets mutations", () => {
  it("list döndürür sadece kullanıcının kendi hayvanlarını", async () => {
    const t = convexTest(schema, modules);

    const aliceId = await t.run((ctx) => ctx.db.insert("users", { name: "Alice" }));
    const bobId = await t.run((ctx) => ctx.db.insert("users", { name: "Bob" }));

    await t.run((ctx) =>
      ctx.db.insert("pets", { userId: aliceId, name: "Mırnav", type: "Kedi" })
    );
    await t.run((ctx) =>
      ctx.db.insert("pets", { userId: bobId, name: "Karabaş", type: "Köpek" })
    );

    const aliceList = await t.withIdentity({ subject: aliceId }).query(api.pets.list, {});
    expect(aliceList.map((p) => p.name)).toEqual(["Mırnav"]);

    const bobList = await t.withIdentity({ subject: bobId }).query(api.pets.list, {});
    expect(bobList.map((p) => p.name)).toEqual(["Karabaş"]);
  });

  it("oturum yoksa list boş döndürür (hata atmaz)", async () => {
    const t = convexTest(schema, modules);
    const result = await t.query(api.pets.list, {});
    expect(result).toEqual([]);
  });

  it("create için oturum şart", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.mutation(api.pets.create, { name: "Test", type: "Kedi" })
    ).rejects.toThrow(/Oturum açık değil/);
  });

  it("başkasının pet'ini update edemez", async () => {
    const t = convexTest(schema, modules);

    const aliceId = await t.run((ctx) => ctx.db.insert("users", { name: "Alice" }));
    const bobId = await t.run((ctx) => ctx.db.insert("users", { name: "Bob" }));

    const petId = await t.run((ctx) =>
      ctx.db.insert("pets", { userId: aliceId, name: "Mırnav", type: "Kedi" })
    );

    await expect(
      t
        .withIdentity({ subject: bobId })
        .mutation(api.pets.update, { id: petId, name: "Çalındı" })
    ).rejects.toThrow(/Yetkisiz erişim/);
  });

  it("remove pet aynı zamanda records ve weights'i de siler (cascade)", async () => {
    const t = convexTest(schema, modules);

    const userId = await t.run((ctx) => ctx.db.insert("users", { name: "Alice" }));
    const petId = await t.run((ctx) =>
      ctx.db.insert("pets", { userId, name: "Mırnav", type: "Kedi" })
    );
    await t.run((ctx) =>
      ctx.db.insert("records", { userId, petId, type: "Karma Aşı", date: "2026-01-01" })
    );
    await t.run((ctx) =>
      ctx.db.insert("weights", { userId, petId, weight: "4.2", date: "2026-01-01" })
    );

    await t.withIdentity({ subject: userId }).mutation(api.pets.remove, { id: petId });

    const remainingRecords = await t.run((ctx) => ctx.db.query("records").collect());
    const remainingWeights = await t.run((ctx) => ctx.db.query("weights").collect());
    const remainingPet = await t.run((ctx) => ctx.db.get(petId));

    expect(remainingPet).toBeNull();
    expect(remainingRecords).toHaveLength(0);
    expect(remainingWeights).toHaveLength(0);
  });

  it("vets alanı sadece tanımlı şekilde güncellenebilir (regresyon: spread bug)", async () => {
    // Bu test eski VetForm bug'ını yakalamak için: mutation validator'ı
    // bilinmeyen alanları reddetmeli. Eski kod `{ ...pet, vets: [...] }` gönderiyordu,
    // _id / _creationTime / userId gibi alanlar validator hatası veriyordu.
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) => ctx.db.insert("users", { name: "Alice" }));
    const petId = await t.run((ctx) =>
      ctx.db.insert("pets", { userId, name: "Mırnav", type: "Kedi" })
    );

    // Doğru kullanım — sadece izin verilen alanlar
    await t.withIdentity({ subject: userId }).mutation(api.pets.update, {
      id: petId,
      vets: [{ clinicName: "Pati Klinik", phone: "0532" }],
    });

    const updated = await t.run((ctx) => ctx.db.get(petId));
    expect(updated?.vets).toEqual([{ clinicName: "Pati Klinik", phone: "0532" }]);

    // Yanlış kullanım — fazladan _id alanı validator'ı tetiklemeli
    await expect(
      t.withIdentity({ subject: userId }).mutation(api.pets.update, {
        id: petId,
        // @ts-expect-error: _id schema args'ta yok, runtime'da reddedilmeli
        _id: petId,
        vets: [{ clinicName: "X" }],
      })
    ).rejects.toThrow();
  });
});
