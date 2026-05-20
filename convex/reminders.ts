"use node";

import webpush from "web-push";
import { internalAction, type ActionCtx } from "./_generated/server";
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

async function pushTo(
  ctx: ActionCtx,
  subscription: Doc<"pushSubscriptions">,
  payload: PushPayload
) {
  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: subscription.keys },
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

type ReminderBucket = {
  userId: string;
  subscriptions: Doc<"pushSubscriptions">[];
  title: string;
  body: string;
};

export const dailySweep = internalAction({
  args: {},
  handler: async (ctx): Promise<{ users: number; sent: number }> => {
    configure();
    const buckets: ReminderBucket[] = await ctx.runQuery(
      internal.remindersInternal.collectReminders,
      {}
    );
    let sent = 0;
    for (const bucket of buckets) {
      const payload: PushPayload = { title: bucket.title, body: bucket.body, url: "/app" };
      const results = await Promise.all(
        bucket.subscriptions.map((s) => pushTo(ctx, s, payload))
      );
      sent += results.filter((r) => r.ok).length;
    }
    return { users: buckets.length, sent };
  },
});
