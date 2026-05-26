"use node";

import { getAuthUserId } from "@convex-dev/auth/server";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Hatırlatıcı e-postasını gönderir. Kimlik doğrulama zorunlu; alıcı ve içerik
 * sunucuda (internal.emailInternal.prepareReminder) kullanıcının kendi
 * verisinden belirlenir — istemci hiçbir alan göndermez.
 *
 * RESEND_API_KEY ve (production'da doğrulanmış domainli) RESEND_FROM,
 * `npx convex env set ...` ile Convex deployment env'ine yazılmalıdır.
 */
export const sendReminder = action({
  args: {},
  handler: async (ctx): Promise<{ ok: true }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Oturum açık değil.");

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("E-posta servisi yapılandırılmamış.");
    const from = process.env.RESEND_FROM ?? "PatiDefteri <onboarding@resend.dev>";

    const { to, userName, reminderList } = await ctx.runMutation(
      internal.emailInternal.prepareReminder,
      { userId }
    );

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🐾 PatiDefteri</h1>
          <p style="color: #d1fae5; margin: 4px 0 0 0; font-size: 14px;">Evcil Hayvan Bakım Hatırlatıcısı</p>
        </div>
        <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
          <p style="color: #374151;">Merhaba <strong>${escapeHtml(userName)}</strong>,</p>
          <p style="color: #374151;">Evcil hayvanlarınız için hatırlatıcılarınız var:</p>
          <div style="background: white; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #10b981; border: 1px solid #e5e7eb;">
            <pre style="margin: 0; font-family: Arial; color: #374151; white-space: pre-wrap; font-size: 14px;">${escapeHtml(reminderList)}</pre>
          </div>
          <p style="color: #374151;">Sağlıklı günler dileriz! 🐾</p>
          <a href="https://pati-defteri.vercel.app/app" style="background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 8px; font-weight: bold;">
            Uygulamayı Aç →
          </a>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            PatiDefteri • Evcil Hayvan Bakım Günlüğü<br>
            Bu maili almak istemiyorsanız uygulamadan email hatırlatıcısını kapatabilirsiniz.
          </p>
        </div>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "🐾 PatiDefteri - Yaklaşan Bakım Hatırlatıcısı",
        html,
      }),
    });

    if (!response.ok) {
      const data: { message?: string } = await response.json().catch(() => ({}));
      throw new Error(data?.message ?? "E-posta gönderilemedi.");
    }

    return { ok: true };
  },
});
