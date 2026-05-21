# LinkedIn Yayın Rehberi

Bu dosya: post metni + paylaşılacak görseller + yayın zamanı + ilk yorum hack'i.

---

## 📸 Hangi görselleri ekle

LinkedIn carousel (image post) en yüksek engagement'ı veriyor. **Tek post'a max 9 görsel** ekleyebilirsin; sıralama önemli.

Repo'da hazır görseller (`/screenshot-*.png`):

| Sıra | Dosya | Niye |
|---|---|---|
| 1 | `screenshot-landing.png` | **Kapak** — hero, en hızlı "ne bu app?" cevabı |
| 2 | `screenshot-home.png` | Demo veri dolu anasayfa — özellik özeti |
| 3 | `screenshot-detail.png` | Pet detay — aşı kayıtları + tab'lar |
| 4 | `screenshot-stats.png` | Grafikler — teknik derinlik sinyali |
| 5 | `screenshot-calendar.png` | Takvim — aktif feature kanıtı |
| 6 | `screenshot-settings.png` | Bildirim + yedek + email — backend feature'lar |

LinkedIn üzerinde sırasıyla yükle. **İlk görsel** (`screenshot-landing.png`) feed'de büyük thumbnail olarak görünecek — kullanıcı tıklayıp post'u açana kadar etkileşim sinyali için en kritik kare.

**İpucu:** Görselleri yüklerken LinkedIn auto-crop yapıyor. Önizlemede her görselin tam göründüğünden emin ol; gerekirse ortalanmış padding'li versiyonlarını ScreenToGif/Photoshop ile elle ayarla.

---

## ✍️ Post taslakları — 3 versiyon

### Versiyon 1 — Hikaye odaklı (önerilen, samimi)

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

---

## ⏰ Yayın zamanı

LinkedIn algoritması ilk 1-2 saatteki etkileşime göre dağıtım kararı veriyor. Türkiye için:

- ✅ **Salı/Çarşamba/Perşembe 09:00-11:00** — en yüksek B2B feed aktivitesi
- ✅ **18:30-20:00** — iş çıkışı scroll trafiği, dev community aktif
- ❌ Cuma akşamı / hafta sonu — algoritma trafiği soğutuyor

---

## 💬 İlk yorum hack'i

Post atılır atmaz **kendi post'una yorum yap** — bu erken etkileşim sinyali algoritmanın post'u feed'e daha çok dağıtmasını sağlar. Ayrıca altta tartışma görünür, başka yorumlar daha doğal gelir.

Önerilen kalıplar (birini seç, kopyala-yapıştır):

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

Soru içeren yorumlar 2-3x daha fazla yanıt alıyor.

---

## 📊 Yayın sonrası ölçüm

**İlk 60 dakika:**
- 30+ impression yoksa yukarıdaki yorum kalıbını çalıştır

**İlk 24 saat:**
- 100+ impression → algoritma post'u beslemeye devam ediyor
- 5+ comment → en güçlü erişim sinyali; her yoruma cevap ver, post tekrar feed'e girer

**Boost taktiği:**
Tanıdığın 3-5 dev arkadaşına post linkini DM at, "5 dakikada bir like + yorum atar mısın?" diye sor. İlk yarım saattin etkileşimi sonraki 24 saatin trafiğini katlar.

---

## 🎯 Ek görseller (opsiyonel)

Görsel sayısını artırmak istersen lokal'de hızlıca üretebileceklerin:

- **Mimari diyagramı** — README.md içindeki ASCII diyagramı [excalidraw.com](https://excalidraw.com)'da çiz, PNG indir. "Stack" görseli olarak 2. sıraya koy.
- **Lighthouse skor görseli** — Chrome DevTools'da audit çalıştır, "Best Practices 100" gösteren ekranı kırp.
- **Code snippet kart** — `convex/pets.ts`'ten `requireOwnedPet` fonksiyonunu [carbon.now.sh](https://carbon.now.sh) ile estetik karta çevir. "Security pattern" örneği olarak.

Bunlar zorunlu değil; 6 hazır screenshot zaten yeterli.
