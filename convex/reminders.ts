"use node";

import webpush from "web-push";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

function configure() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    throw new Error("VAPID anahtarları yapılandırılmamış.");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

async function pushTo(ctx, subscription, payload) {
  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: subscription.keys },
      JSON.stringify(payload)
    );
    return { ok: true };
  } catch (err) {
    if (err?.statusCode === 404 || err?.statusCode === 410) {
      await ctx.runMutation(internal.pushInternal.deleteSubscriptionById, {
        id: subscription._id,
      });
      return { ok: false, gone: true };
    }
    return { ok: false, error: String(err?.message ?? err) };
  }
}

export const dailySweep = internalAction({
  args: {},
  handler: async (ctx) => {
    configure();
    const buckets = await ctx.runQuery(internal.remindersInternal.collectReminders, {});
    let sent = 0;
    for (const bucket of buckets) {
      const payload = { title: bucket.title, body: bucket.body, url: "/app" };
      const results = await Promise.all(
        bucket.subscriptions.map((s) => pushTo(ctx, s, payload))
      );
      sent += results.filter((r) => r.ok).length;
    }
    return { users: buckets.length, sent };
  },
});
