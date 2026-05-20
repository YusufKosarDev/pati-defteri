"use node";

import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import webpush from "web-push";
import { action, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";

type WebPushError = { statusCode?: number; message?: string };
type PushPayload = { title: string; body: string; url?: string };

function configure() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    throw new Error("VAPID anahtarları yapılandırılmamış.");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export const saveSubscription = action({
  args: {
    endpoint: v.string(),
    keys: v.object({ p256dh: v.string(), auth: v.string() }),
  },
  handler: async (ctx, { endpoint, keys }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Oturum açık değil.");
    await ctx.runMutation(internal.pushInternal.upsertSubscription, {
      userId,
      endpoint,
      keys,
    });
  },
});

export const removeSubscription = action({
  args: { endpoint: v.string() },
  handler: async (ctx, { endpoint }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Oturum açık değil.");
    await ctx.runMutation(internal.pushInternal.deleteSubscriptionByEndpoint, {
      userId,
      endpoint,
    });
  },
});

async function sendToSubscription(
  ctx: ActionCtx,
  subscription: Doc<"pushSubscriptions">,
  payload: PushPayload
) {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload)
    );
    return { ok: true };
  } catch (err) {
    const e = err as WebPushError;
    if (e?.statusCode === 404 || e?.statusCode === 410) {
      await ctx.runMutation(internal.pushInternal.deleteSubscriptionById, {
        id: subscription._id,
      });
      return { ok: false, gone: true };
    }
    return { ok: false, error: String(e?.message ?? err) };
  }
}

export const sendTestPush = action({
  args: {},
  handler: async (ctx): Promise<{ sent: number; total: number }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Oturum açık değil.");
    configure();

    const subs: Doc<"pushSubscriptions">[] = await ctx.runQuery(
      internal.pushInternal.listSubscriptionsForUser,
      { userId }
    );
    if (subs.length === 0) {
      throw new Error("Henüz push aboneliği yok.");
    }

    const payload: PushPayload = {
      title: "PatiDefteri 🐾",
      body: "Test bildirimi başarıyla geldi!",
      url: "/app",
    };

    const results = await Promise.all(
      subs.map((s) => sendToSubscription(ctx, s, payload))
    );
    return { sent: results.filter((r) => r.ok).length, total: subs.length };
  },
});
