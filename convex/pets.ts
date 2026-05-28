import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { checkRateLimit } from "./rateLimit";
import { assertTextLimits, assertVetLimits } from "./validators";
import { requireUser, requireOwnedPet } from "./lib/auth";
import { vetObject as vetArg } from "./lib/vetArg";

async function attachPhotoUrl(ctx: QueryCtx, pet: Doc<"pets">) {
  if (pet.photoStorageId) {
    const url = await ctx.storage.getUrl(pet.photoStorageId);
    return { ...pet, photoUrl: url };
  }
  return { ...pet, photoUrl: pet.photo ?? null };
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("pets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return await Promise.all(rows.map((p) => attachPhotoUrl(ctx, p)));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    breed: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    photo: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
    notes: v.optional(v.string()),
    vets: v.optional(v.array(vetArg)),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    assertTextLimits(args);
    assertVetLimits(args.vets);
    // Bot abuse'a karşı: kullanıcı başına dakikada max 30 pet (gerçek kullanım için fazlasıyla yeterli)
    await checkRateLimit(ctx, userId, "pets.create", 30, 60_000);
    return await ctx.db.insert("pets", { ...args, userId });
  },
});

export const update = mutation({
  args: {
    id: v.id("pets"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    breed: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    photo: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
    notes: v.optional(v.string()),
    vets: v.optional(v.array(vetArg)),
    // Kullanıcı mevcut fotoğrafı kaldırdığında istemci bunu açıkça gönderir.
    // Convex argümanlardaki `undefined`'ı eler; bu yüzden "kaldır" niyeti, alanın
    // hiç gönderilmemesinden (ör. yalnızca vets güncellemesi) ayırt edilemez ve
    // açık bir bayrak gerekir.
    clearPhoto: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, clearPhoto, ...patch }) => {
    const { userId, pet } = await requireOwnedPet(ctx, id);
    assertTextLimits(patch);
    assertVetLimits(patch.vets);
    await checkRateLimit(ctx, userId, "pets.update", 120, 60_000);

    // Artık kullanılmayan eski storage objesini sil ki yetim (orphan) dosya
    // birikmesin. Yalnızca açık bir foto değişiminde tetiklenir; vets gibi kısmi
    // güncellemeler fotoğrafa dokunmaz.
    const replacingWithUpload =
      patch.photoStorageId !== undefined && patch.photoStorageId !== pet.photoStorageId;
    const switchingToUrl = typeof patch.photo === "string" && patch.photo.length > 0;

    if (pet.photoStorageId && (replacingWithUpload || switchingToUrl || clearPhoto)) {
      await ctx.storage.delete(pet.photoStorageId);
    }

    // URL'e geçildiyse ya da foto kaldırıldıysa eski storage referansını düşür.
    if (clearPhoto) {
      patch.photo = undefined;
      patch.photoStorageId = undefined;
    } else if (switchingToUrl) {
      patch.photoStorageId = undefined;
    }

    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("pets") },
  handler: async (ctx, { id }) => {
    const { userId, pet } = await requireOwnedPet(ctx, id);
    await checkRateLimit(ctx, userId, "pets.remove", 60, 60_000);

    const records = await ctx.db
      .query("records")
      .withIndex("by_pet", (q) => q.eq("petId", id))
      .collect();
    for (const r of records) await ctx.db.delete(r._id);

    const weights = await ctx.db
      .query("weights")
      .withIndex("by_pet", (q) => q.eq("petId", id))
      .collect();
    for (const w of weights) await ctx.db.delete(w._id);

    if (pet.photoStorageId) {
      await ctx.storage.delete(pet.photoStorageId);
    }

    await ctx.db.delete(id);
  },
});
