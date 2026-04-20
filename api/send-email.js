export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, userName, reminderList } = req.body;

  if (!to || !reminderList) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PatiDefteri <onboarding@resend.dev>",
        to: [to],
        subject: "🐾 PatiDefteri - Yaklaşan Bakım Hatırlatıcısı",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #10b981; padding: 24px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🐾 PatiDefteri</h1>
              <p style="color: #d1fae5; margin: 4px 0 0 0; font-size: 14px;">Evcil Hayvan Bakım Hatırlatıcısı</p>
            </div>
            <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
              <p style="color: #374151;">Merhaba <strong>${userName || "Sevgili Kullanıcı"}</strong>,</p>
              <p style="color: #374151;">Evcil hayvanlarınız için hatırlatıcılarınız var:</p>
              <div style="background: white; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #10b981; border: 1px solid #e5e7eb;">
                <pre style="margin: 0; font-family: Arial; color: #374151; white-space: pre-wrap; font-size: 14px;">${reminderList}</pre>
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
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || "Email gönderilemedi." });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    return res.status(500).json({ error: "Sunucu hatası." });
  }
}