import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { captureException } from "../lib/sentry";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  // ArrayBuffer üzerinde kur ki tip BufferSource (applicationServerKey) ile uyumlu olsun.
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}

function subscriptionToJSON(sub: PushSubscription) {
  const json = sub.toJSON();
  return {
    endpoint: json.endpoint ?? "",
    keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" },
  };
}

function useNotifications() {
  const isSupported =
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported ? Notification.permission : "denied"
  );

  const saveSubscription = useAction(api.push.saveSubscription);
  const removeSubscription = useAction(api.push.removeSubscription);
  const sendTestPush = useAction(api.push.sendTestPush);

  async function ensureSubscribed() {
    if (!isSupported || !VAPID_PUBLIC_KEY) return null;
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }
    await saveSubscription(subscriptionToJSON(sub));
    return sub;
  }

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) return "denied";
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        await ensureSubscribed();
      }
      return result;
    } catch (err) {
      captureException(err, { context: "Notification.requestPermission" });
      return "denied";
    }
  };

  const unsubscribe = async () => {
    if (!isSupported) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await removeSubscription({ endpoint: sub.endpoint });
      await sub.unsubscribe();
    }
  };

  const sendTest = async () => {
    await ensureSubscribed();
    return await sendTestPush({});
  };

  return {
    permission,
    isSupported,
    isConfigured: !!VAPID_PUBLIC_KEY,
    isReady: isSupported && !!VAPID_PUBLIC_KEY,
    requestPermission,
    unsubscribe,
    sendTest,
  };
}

export default useNotifications;
