import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { checkRateLimit } from "./rateLimit";

const vetArg = v.object({
  clinicName: v.optional(v.string()),
  doctorName: v.optional(v.string()),
  phone: v.optional(v.string()),
  address: v.optional(v.string()),
  notes: v.optional(v.string()),
});

async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Oturum açık değil.");
  return userId;
}

async function requireOwnedPet(ctx: MutationCtx, petId: Id<"pets">) {
  const userId = await requireUser(ctx);
  const pet = await ctx.db.get(petId);
  if (!pet || pet.userId !== userId) {
    throw new Error("Yetkisiz erişim.");
  }
  return { userId, pet };
}

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
  },
  handler: async (ctx, { id, ...patch }) => {
    await requireOwnedPet(ctx, id);
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("pets") },
  handler: async (ctx, { id }) => {
    const { pet } = await requireOwnedPet(ctx, id);

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
