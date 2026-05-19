import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

const vetArg = v.object({
  clinicName: v.optional(v.string()),
  doctorName: v.optional(v.string()),
  phone: v.optional(v.string()),
  address: v.optional(v.string()),
  notes: v.optional(v.string()),
});

async function requireUser(ctx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Oturum açık değil.");
  return userId;
}

async function requireOwnedPet(ctx, petId) {
  const userId = await requireUser(ctx);
  const pet = await ctx.db.get(petId);
  if (!pet || pet.userId !== userId) {
    throw new Error("Yetkisiz erişim.");
  }
  return { userId, pet };
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("pets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    breed: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    photo: v.optional(v.string()),
    notes: v.optional(v.string()),
    vets: v.optional(v.array(vetArg)),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
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
    await requireOwnedPet(ctx, id);

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

    await ctx.db.delete(id);
  },
});
