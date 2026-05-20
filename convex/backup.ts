import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, type MutationCtx, type QueryCtx } from "./_generated/server";

const vetArg = v.object({
  clinicName: v.optional(v.string()),
  doctorName: v.optional(v.string()),
  phone: v.optional(v.string()),
  address: v.optional(v.string()),
  notes: v.optional(v.string()),
});

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

async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Oturum açık değil.");
  return userId;
}

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
