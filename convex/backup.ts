import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { checkRateLimit } from "./rateLimit";
import { assertTextLimits, assertVetLimits } from "./validators";
import { requireUser } from "./lib/auth";
import { vetObject as vetArg } from "./lib/vetArg";

const petArg = v.object({
  name: v.string(),
  type: v.string(),
  breed: v.optional(v.string()),
  birthDate: v.optional(v.string()),
  photo: v.optional(v.string()),
  notes: v.optional(v.string()),
  vets: v.optional(v.array(vetArg)),
  legacyId: v.optional(v.string()),
});

const recordArg = v.object({
  legacyPetId: v.string(),
  type: v.string(),
  date: v.string(),
  nextDate: v.optional(v.string()),
  notes: v.optional(v.string()),
});

const weightArg = v.object({
  legacyPetId: v.string(),
  weight: v.string(),
  date: v.string(),
  notes: v.optional(v.string()),
});

/**
 * Bir kullanıcının tüm verisini tek seferde içe aktarır. Demo loader ve
 * JSON yedek dosyalarından import için kullanılır.
 *
 * Mevcut verinin üzerine yazar: önce eski pets/records/weights silinir,
 * sonra yeni veri eklenir.
 */
export const replaceAll = mutation({
  args: {
    pets: v.array(petArg),
    records: v.array(recordArg),
    weights: v.array(weightArg),
  },
  handler: async (ctx, { pets, records, weights }) => {
    const userId = await requireUser(ctx);
    // İçe aktarılan her öğenin metin alanlarını doğrula (devasa string reddedilir)
    for (const p of pets) {
      assertTextLimits(p);
      assertVetLimits(p.vets);
    }
    for (const r of records) assertTextLimits(r);
    for (const w of weights) assertTextLimits(w);
    // Demo loader bot abuse'a karşı: dakikada max 5 toplu içe aktarma
    await checkRateLimit(ctx, userId, "backup.replaceAll", 5, 60_000);

    // Mevcut veriyi sil
    const oldPets = await ctx.db
      .query("pets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const p of oldPets) {
      const oldRecords = await ctx.db
        .query("records")
        .withIndex("by_pet", (q) => q.eq("petId", p._id))
        .collect();
      for (const r of oldRecords) await ctx.db.delete(r._id);

      const oldWeights = await ctx.db
        .query("weights")
        .withIndex("by_pet", (q) => q.eq("petId", p._id))
        .collect();
      for (const w of oldWeights) await ctx.db.delete(w._id);

      await ctx.db.delete(p._id);
    }

    // Yeni petleri ekle, legacyId → yeni Id eşlemesi tut
    const legacyToNew = new Map();
    for (const { legacyId, ...rest } of pets) {
      const newId = await ctx.db.insert("pets", { ...rest, userId });
      if (legacyId) legacyToNew.set(legacyId, newId);
    }

    // Kayıtları ve ağırlıkları yeni petId'lerle ekle
    for (const { legacyPetId, ...rest } of records) {
      const petId = legacyToNew.get(legacyPetId);
      if (!petId) continue;
      await ctx.db.insert("records", { ...rest, petId, userId });
    }
    for (const { legacyPetId, ...rest } of weights) {
      const petId = legacyToNew.get(legacyPetId);
      if (!petId) continue;
      await ctx.db.insert("weights", { ...rest, petId, userId });
    }

    return {
      pets: legacyToNew.size,
      records: records.length,
      weights: weights.length,
    };
  },
});
