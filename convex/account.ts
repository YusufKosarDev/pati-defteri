import { v } from "convex/values";
import {
  getAuthUserId,
  retrieveAccount,
  modifyAccountCredentials,
  createAccount,
  invalidateSessions,
} from "@convex-dev/auth/server";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

const PASSWORD_PROVIDER = "password";
const MIN_PASSWORD = 6;

/**
 * Giriş yapmış kullanıcının şifresini değiştirir. Mevcut şifre doğrulanır,
 * ardından yenisi yazılır.
 */
export const changePassword = action({
  args: { currentPassword: v.string(), newPassword: v.string() },
  handler: async (ctx, { currentPassword, newPassword }): Promise<{ ok: true }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Oturum açık değil.");

    if (newPassword.length < MIN_PASSWORD) {
      throw new Error(`Yeni şifre en az ${MIN_PASSWORD} karakter olmalı.`);
    }

    // Brute-force'a karşı: dakikada max 5 deneme
    await ctx.runMutation(internal.accountInternal.rateLimit, {
      userId,
      key: "account.changePassword",
      max: 5,
      windowMs: 60_000,
    });

    const info = await ctx.runQuery(internal.accountInternal.getAuthInfo, { userId });
    if (!info?.email) {
      throw new Error("Bu hesapta şifre değiştirilemez.");
    }

    try {
      await retrieveAccount(ctx, {
        provider: PASSWORD_PROVIDER,
        account: { id: info.email, secret: currentPassword },
      });
    } catch {
      throw new Error("Mevcut şifre hatalı.");
    }

    await modifyAccountCredentials(ctx, {
      provider: PASSWORD_PROVIDER,
      account: { id: info.email, secret: newPassword },
    });

    return { ok: true };
  },
});

/**
 * Hesabı ve ona bağlı TÜM veriyi kalıcı olarak siler (pet/kayıt/ağırlık/push,
 * fotoğraflar, auth hesapları, oturumlar). Geri alınamaz.
 */
export const deleteAccount = action({
  args: {},
  handler: async (ctx): Promise<{ ok: true }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Oturum açık değil.");

    await invalidateSessions(ctx, { userId });
    await ctx.runMutation(internal.accountInternal.purgeUser, { userId });

    return { ok: true };
  },
});

/**
 * Misafir (anonim) hesabı kalıcı e-posta/şifre hesabına yükseltir. Misafirin
 * tüm verisi yeni hesaba taşınır, eski anonim kullanıcı temizlenir. İşlem
 * sonrası istemci yeni hesapla yeniden signIn yapmalıdır.
 */
export const upgradeGuest = action({
  args: { name: v.string(), email: v.string(), password: v.string() },
  handler: async (ctx, { name, email, password }): Promise<{ ok: true }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Oturum açık değil.");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error("İsim zorunlu.");
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) throw new Error("Geçerli bir e-posta girin.");
    if (password.length < MIN_PASSWORD) {
      throw new Error(`Şifre en az ${MIN_PASSWORD} karakter olmalı.`);
    }

    await ctx.runMutation(internal.accountInternal.rateLimit, {
      userId,
      key: "account.upgradeGuest",
      max: 5,
      windowMs: 60_000,
    });

    const info = await ctx.runQuery(internal.accountInternal.getAuthInfo, { userId });
    if (!info?.isAnonymous) {
      throw new Error("Bu hesap zaten kayıtlı.");
    }

    const taken = await ctx.runQuery(internal.accountInternal.emailTaken, {
      email: trimmedEmail,
      exceptUserId: userId,
    });
    if (taken) throw new Error("Bu e-posta zaten kayıtlı.");

    const { user: newUser } = await createAccount(ctx, {
      provider: PASSWORD_PROVIDER,
      account: { id: trimmedEmail, secret: password },
      profile: { name: trimmedName, email: trimmedEmail },
    });

    await ctx.runMutation(internal.accountInternal.migrateAndPurgeOldUser, {
      fromUserId: userId,
      toUserId: newUser._id,
    });

    await invalidateSessions(ctx, { userId });

    return { ok: true };
  },
});
