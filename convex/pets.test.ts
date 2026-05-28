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

  it("create aşırı uzun ismi reddeder (uzunluk doğrulaması)", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) => ctx.db.insert("users", { name: "Alice" }));

    await expect(
      t.withIdentity({ subject: userId }).mutation(api.pets.create, {
        name: "x".repeat(101),
        type: "Kedi",
      })
    ).rejects.toThrow(/en fazla/);

    // Veteriner notu da sınırlanmalı
    await expect(
      t.withIdentity({ subject: userId }).mutation(api.pets.create, {
        name: "Mırnav",
        type: "Kedi",
        vets: [{ clinicName: "x".repeat(151) }],
      })
    ).rejects.toThrow(/en fazla/);
  });

  it("update fotoğrafı değiştirince/kaldırınca eski storage objesini siler (orphan bırakmaz)", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) => ctx.db.insert("users", { name: "Alice" }));

    const oldStorageId = await t.run((ctx) => ctx.storage.store(new Blob(["old"])));
    const petId = await t.run((ctx) =>
      ctx.db.insert("pets", { userId, name: "Mırnav", type: "Kedi", photoStorageId: oldStorageId })
    );

    // t.run dönüş değerini Convex değeri olarak serialize ettiğinden Blob'u
    // doğrudan döndürmüyoruz; callback içinde varlık kontrolünü boolean'a çeviriyoruz.
    const exists = (id) => t.run(async (ctx) => (await ctx.storage.get(id)) !== null);

    // Yeni fotoğraf yüklenince eski silinmeli, yeni durmalı
    const newStorageId = await t.run((ctx) => ctx.storage.store(new Blob(["new"])));
    await t.withIdentity({ subject: userId }).mutation(api.pets.update, {
      id: petId,
      photoStorageId: newStorageId,
    });
    expect(await exists(oldStorageId)).toBe(false);
    expect(await exists(newStorageId)).toBe(true);

    // Fotoğraf tamamen kaldırılınca yeni de silinmeli ve referans düşmeli
    await t.withIdentity({ subject: userId }).mutation(api.pets.update, {
      id: petId,
      clearPhoto: true,
    });
    expect(await exists(newStorageId)).toBe(false);
    const updated = await t.run((ctx) => ctx.db.get(petId));
    expect(updated?.photoStorageId).toBeUndefined();
  });

  it("vets güncellemesi mevcut fotoğrafa dokunmaz", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) => ctx.db.insert("users", { name: "Alice" }));
    const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["x"])));
    const petId = await t.run((ctx) =>
      ctx.db.insert("pets", { userId, name: "Mırnav", type: "Kedi", photoStorageId: storageId })
    );

    await t.withIdentity({ subject: userId }).mutation(api.pets.update, {
      id: petId,
      vets: [{ clinicName: "Pati" }],
    });

    const stillThere = await t.run(async (ctx) => (await ctx.storage.get(storageId)) !== null);
    expect(stillThere).toBe(true);
    const updated = await t.run((ctx) => ctx.db.get(petId));
    expect(updated?.photoStorageId).toBe(storageId);
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
