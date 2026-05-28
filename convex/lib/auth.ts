// Ortak kimlik / sahiplik guard'ları. pets/records/weights/users mutation'ları
// arasında tekrarlanan `requireUser` ve `requireOwnedPet` mantığı buradan paylaşılır.

import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export async function requireUser(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Oturum açık değil.");
  return userId;
}

export async function requireOwnedPet(ctx: MutationCtx, petId: Id<"pets">) {
  const userId = await requireUser(ctx);
  const pet = await ctx.db.get(petId);
  if (!pet || pet.userId !== userId) {
    throw new Error("Yetkisiz erişim.");
  }
  return { userId, pet };
}
