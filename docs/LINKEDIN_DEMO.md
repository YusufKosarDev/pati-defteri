# LinkedIn Demo Video — Çekim Rehberi

LinkedIn algoritması video/GIF post'larını text-only post'tan ~3x daha fazla impression veriyor. 15-30 saniye, sessiz oynatılabilen, ilk 3 saniyede "neyle ilgili" anlaşılır olmalı.

## Otomatik kayıt (Playwright)

```bash
npm run demo:record
```

Production URL'den 1280×720 webm kaydeder. Çıktı: `scripts/output/`.

```bash
# MP4'e çevir (LinkedIn'in tercih ettiği format)
ffmpeg -i scripts/output/*.webm -c:v libx264 -preset slow -crf 22 demo.mp4

# GIF'e çevir (LinkedIn yorumlarına / sticky thumbnail için)
ffmpeg -i demo.mp4 -vf "fps=15,scale=720:-1:flags=lanczos" -loop 0 demo.gif
```

## Manuel kayıt (önerilen — daha cilalı)

**Araçlar:**
- Windows: [ScreenToGif](https://www.screentogif.com/) (ücretsiz, kırpma + crop + caption desteği)
- Mac: [CleanShot X](https://cleanshot.com/) veya QuickTime + Handbrake
- Cross-platform: [Cap.so](https://cap.so/), [Loom](https://loom.com/)

**Ayarlar:**
- 1080p, 30 fps (LinkedIn 1080p destekler, daha düşük çözünürlük "amatör" hisseder)
- 16:9 (1920×1080) veya 1:1 (1080×1080 mobil feed'de büyük görünür)
- Maksimum 30 saniye (LinkedIn 30s sonra ses açmadan oynatmaya devam etmez)
- Ses olmadan anlaşılabilir olmalı — sahnelerde dikkat çekici animasyon ve veri kullan

## Çekim senaryosu (28 saniye)

| Saniye | Sahne | Eylem |
|---|---|---|
| 0-3 | **Hook** — Landing | Hero kısmı, "PatiDefteri" başlığı, 2 saniyelik scroll-down özet |
| 3-6 | **Giriş** | "Misafir olarak devam et" tıkla → /app'e geçiş |
| 6-9 | **Demo data yüklenme** | Otomatik 2 pet + 8 record yükleniyor, toast'ı yakala |
| 9-13 | **Anasayfa** | İstatistik kartları, summary banner ("Gecikmiş bakım var"), pet kartları |
| 13-18 | **Pet detay** | Pamuk'a tıkla → Records sekmesi → Weight tab (grafik) → Vet tab |
| 18-22 | **Calendar** | /calendar'a git, takvim grafiği, bir güne tıkla |
| 22-26 | **Stats** | /stats, 4 grafik (monthly, type pie, per-pet bar, weight trend) |
| 26-28 | **CTA** | "Open Source on GitHub" overlay ekle — repo URL'i göster |

## İlk frame önerisi

LinkedIn auto-play'de ilk frame thumbnail oluyor. **Hero sahnesi** (emerald logo + "PatiDefteri" başlığı + arkada renkli daireler) en güzel duruyor. Eğer ScreenToGif kullanıyorsan timeline'da ilk 1-2 saniyeyi öne çekebilirsin.

## Caption ekleme (önerilen)

Sessiz oynatılabilirlik için video üstüne kısa Türkçe + İngilizce caption koy:

| Saniye | Caption |
|---|---|
| 0-3 | "Evcil hayvanın için tek yerden bakım takibi" |
| 6-9 | "Misafir modunda demo veriler hazır" |
| 13-18 | "Aşı, ağırlık, veteriner — her şey burada" |
| 22-26 | "Otomatik istatistikler + grafikler" |
| 26-28 | "Açık kaynak · React 19 + Convex" |

## LinkedIn post taslağı

### Versiyon 1 — Hikaye odaklı (önerilen, daha samimi)

```
🐾 PatiDefteri — kendi yazdığım fullstack web uygulaması canlıda.

Evcil hayvan sahibiyseniz biliyorsunuz: aşı tarihleri, parazit damlaları,
ağırlık takibi — her şey ayrı bir takvimde, ayrı bir kafa karışıklığı.
Tek yerden takip edebileceğim bir şey yoktu, ben de yaptım.

Yol boyunca öğrendiklerim:
→ Convex ile real-time backend ne kadar hızlı kurulabiliyor
→ Web Push + service worker pipeline'ı (VAPID, daily cron, subscription lifecycle)
→ React 19'un yeni anti-pattern lint kurallarıyla 5 sessiz bug yakaladım
→ TypeScript strict + convex-test ile auth/ownership davranışını teste sabitledim

Tek başıma, scratch'ten:
✅ React 19 + Vite 8 + Tailwind 4 + TypeScript strict
✅ Convex (auth, cron, storage, real-time queries)
✅ Web Push notifications + Email reminders (Resend)
✅ PWA — telefona kurulabilir, offline çalışır
✅ 34 entegrasyon testi, Lighthouse Best Practices 100
✅ Sentry observability, husky pre-commit, GitHub Actions CI

🌐 Demo (misafir modu, demo veriler hazır): https://pati-defteri.vercel.app
💻 Açık kaynak (MIT): https://github.com/YusufKosarDev/pati-defteri

Feedback'e açığım — özellikle hangi feature ilginizi çekti?

#WebDev #React #TypeScript #Convex #FullStack #OpenSource #PWA
```

### Versiyon 2 — Mühendislik odaklı (recruiter için sinyal yoğun)

```
🐾 PatiDefteri'yi yayınladım — açık kaynak fullstack PWA.

Stack:
• React 19 + Vite 8 + Tailwind 4 + TypeScript (strict mode)
• Convex backend (real-time queries, auth, storage, cron jobs)
• Web Push (VAPID + service worker + günlük tarama action)
• Sentry (error + session replay on error)
• 34 entegrasyon testi (convex-test ile auth/ownership doğrulanmış)

Süreçten 3 not:
1. Her Convex mutation server-side `requireOwnedX` guard'ı ile korunuyor —
   client-side check yerine. Multi-tenant izolasyon teste sabitlendi.
2. React 19 hooks plugin'i set-state-in-effect + render-time component
   gibi 5 anti-pattern'ı linter seviyesinde yakalıyor — pre-commit'te bloklanıyor.
3. PDF export jsPDF + html2canvas dinamik import ile lazy load —
   PetDetailPage bundle 491 KB → 89 KB (gzip).

🌐 https://pati-defteri.vercel.app — "Misafir olarak devam et" ile demoyu hemen dene
💻 https://github.com/YusufKosarDev/pati-defteri — MIT

#React #TypeScript #Convex #FullStack #OpenSource
```

### Versiyon 3 — Kısa & punch (zayıf saatte paylaşıyorsan)

```
Yeni yayınladım 🚀

PatiDefteri — evcil hayvanın için aşı, ağırlık, veteriner takibi.
PWA olarak telefona kuruluyor, web push ile hatırlatıyor.

Tek başıma, açık kaynak.
React 19 · Convex · TypeScript · 34 test · Lighthouse 100.

🌐 https://pati-defteri.vercel.app
💻 https://github.com/YusufKosarDev/pati-defteri

#WebDev #FullStack #OpenSource
```

## Yayın zamanı

LinkedIn algoritması ilk 1-2 saatteki etkileşime göre dağıtım kararı veriyor. Türkiye için en iyi saatler:

- **Salı/Çarşamba/Perşembe 09:00-11:00** — en yüksek B2B feed aktivitesi
- **18:30-20:00** — iş çıkışı scroll trafiği, recruiter daha az ama dev community aktif
- ❌ Cuma akşamı / hafta sonu — algoritma trafiği soğutuyor

## Yayın sonrası ölçüm + müdahale

**İlk 60 dakika:**
- 30+ impression yoksa yorum başlat (aşağıya bak)
- Yorumlara hemen yanıt ver — algoritma "post yaşıyor" sinyali alır

**İlk 24 saat:**
- 100+ impression → algoritma post'u beslemeye devam ediyor demektir
- 5+ comment → en yüksek erişim sinyali; her yoruma cevap vermek post'u tekrar feed'e sokar

## İlk yorum hack'i (önemli)

LinkedIn algoritması post'un kendisini değil, **erken etkileşim hızını** ölçer. Post'u atar atmaz **kendi post'una yorum yap** — bu tekrar tıklama-açma trafiği yaratır + altta tartışma görünür.

Önerilen ilk yorum kalıpları:

```
GitHub repo'sundaki en ilginç teknik detay → her Convex mutation'ı
server-side ownership guard ile korunuyor + bunu integration test
ile sabitledim. Multi-tenant SaaS pattern'i learning experience'ı oldu.
```

```
Demo'da "Misafir olarak devam et" tıklayanlar için 2 örnek pet ve
8 record otomatik yükleniyor — UX detayı ama ilk izlenim için kritikmiş.
Boş ekran "bu app ne yapıyor?" sorusu yaratıyor.
```

```
Ucu açık soru: Convex'i Firebase/Supabase'e tercih etmemin sebebi
real-time query subscription'ları + TypeScript codegen otomasyonu oldu.
Sizin tercih sıralamanız nedir?
```

(Soru içeren yorumlar 2-3x daha fazla yanıt alır.)

## Notlar

- Playwright script'i headless OLMADAN çalışıyor (`headless: false`) → kayıt sırasında ekranınızda görünür. Bu daha gerçekçi animasyon ve geçiş zamanı verir.
- Production URL'de çalıştırıyorsanız Convex deployment'ında VAPID/Sentry env'lerinin set olmasını kontrol edin, aksi halde Settings sayfasında uyarı kutusu görünür ve video'da bozuk durur.
- Lokal `npm run dev` ile çekersen daha hızlı + cache miss yok → daha akıcı.
