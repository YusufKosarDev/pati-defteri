# 🐾 PatiDefteri

> Evcil hayvanlarınızın aşı, bakım ve sağlık geçmişini tek bir yerden takip etmenizi sağlayan tam-yığın (fullstack) web uygulaması.

**🌐 Canlı Demo:** [pati-defteri.vercel.app](https://pati-defteri.vercel.app)

---

## 📸 Ekran Görüntüleri

### 🏠 Landing Page
![Landing Page](screenshot-landing.png)

### 🐾 Anasayfa — Hayvanlarım
![Anasayfa](screenshot-home.png)

### 🐶 Hayvan Detay — Kayıtlar
![Hayvan Detay](screenshot-detail.png)

### 📊 İstatistikler
![İstatistikler](screenshot-stats.png)

### 📅 Aşı Takvimi
![Takvim](screenshot-calendar.png)

### ⚙️ Ayarlar
![Ayarlar](screenshot-settings.png)

---

## ✨ Özellikler

### 🔐 Hesap & Senkronizasyon
- Email / şifre ile kayıt ve giriş
- Misafir modu (hızlı deneme için tek tıkla giriş)
- Çok cihazlı gerçek-zamanlı senkronizasyon — bir tarayıcıda eklediğin kayıt, diğerinde anında görünür

### 🐶 Hayvan Yönetimi
- Kedi, köpek ve diğer evcil hayvanlar için profil
- Fotoğraf, cins, doğum tarihi ve notlar
- Otomatik yaş hesaplama
- Renkli harf avatarı (fotoğraf yoksa)
- İsme göre arama, çoklu sıralama seçenekleri
- Birden fazla veteriner bilgisi

### 💉 Aşı & Bakım Takibi
- Karma aşı, kuduz, parazit damlası, pire ilacı ve diğerleri
- Sonraki tarih hatırlatıcıları
- Gecikmiş ve yaklaşan bakımlar için uyarı sistemi
- Drag & drop ile kayıt sıralama (sunucuda kalıcı)
- Kayıt türüne göre filtreleme

### ⚖️ Ağırlık Takibi
- Zaman içindeki kilo değişimi için interaktif grafik

### 📊 İstatistikler & Takvim
- Aylık kayıt grafiği, tür dağılımı, hayvan başı kayıt karşılaştırması
- Tüm bakımların aylık takvim görünümü

### 🔔 Sunucu-tetikli Push Bildirimleri
- VAPID tabanlı Web Push aboneliği
- Uygulama kapalıyken bile gelen bildirimler
- Her gün otomatik tarama (Convex cron) — yaklaşan ve gecikmiş bakımlar için bildirim

### 📄 PDF Rapor & 📱 QR Paylaşımı
- Hayvanın tüm sağlık geçmişini tek tıkla PDF olarak indir
- Hayvanın sağlık kartını QR kod ile veterinerinle paylaş

### 💾 Yedekleme
- Tüm verini JSON olarak indir / yükle
- Eski formatları geriye dönük uyumlu içe aktarır (tek mutation'da)

### 🎨 Kullanıcı Deneyimi
- Modern karanlık tema
- Türkçe / İngilizce dil desteği
- Framer Motion animasyonları, skeleton loading
- Responsive tasarım (mobil uyumlu)
- PWA — telefona uygulama olarak kurulabilir
- Onboarding ve konfeti animasyonu

---

## 🏗️ Mimari

```
┌──────────────────────┐         ┌──────────────────────┐
│  React 19 + Vite     │ ◀────▶  │  Convex (Backend)    │
│  Tailwind, Recharts  │         │  • Postgres tables   │
│  Framer Motion       │         │  • Auth (Anonymous + │
│  PWA + Service Worker│         │    Password)         │
└──────────┬───────────┘         │  • Storage (foto CDN)│
           │                     │  • Actions (Node JS) │
           │                     │  • Cron (günlük push)│
   Web Push (VAPID)              └──────────┬───────────┘
           │                                │
           ▼                                ▼
   Tarayıcı / Telefon             web-push + Resend
```

- **Frontend:** Vite + React, tüm UI client-side
- **Backend:** Convex — gerçek-zamanlı Postgres + sunucu fonksiyonları + dosya depolama
- **Auth:** `@convex-dev/auth` — Anonymous (misafir) + Password (kayıt) provider'ları
- **Storage:** Hayvan fotoğrafları Convex Storage (CDN), DB satırlarına gömülmez
- **Bildirim:** Convex action içinde `web-push` ile VAPID push; günlük cron tarama
- **Hosting:** Vercel (frontend) + Convex deployment (backend)

---

## 🛠️ Teknoloji Yığını

### Frontend
| Paket | Kullanım |
|-------|----------|
| React 19 | UI framework |
| Vite 8 | Build tool |
| Tailwind CSS 4 | Styling |
| Framer Motion | Animasyonlar |
| React Router v7 | Sayfa yönetimi |
| Recharts | Grafikler |
| i18next | Çoklu dil |
| jsPDF | PDF üretimi |
| @dnd-kit | Drag & drop |
| qrcode.react | QR kod üretimi |
| canvas-confetti | Konfeti |
| react-hot-toast | Bildirim toast'ları |

### Backend & Altyapı
| Paket | Kullanım |
|-------|----------|
| Convex | Postgres + queries + actions + cron + storage |
| @convex-dev/auth | Email/şifre + anonim oturum |
| web-push | VAPID tabanlı Web Push |
| Resend | E-posta hatırlatıcıları |

### Test & CI
| Paket | Kullanım |
|-------|----------|
| Vitest + jsdom | Unit testler |
| Playwright | E2E + otomatik ekran görüntüsü |
| GitHub Actions | CI (lint · test · build) |
| ESLint | Statik analiz |

---

## 🧑‍💻 Lokal Geliştirme

```bash
# 1) Bağımlılıkları kur
npm install

# 2) Convex backend'i başlat (ilk çalıştırmada login + proje yaratır)
npx convex dev

# 3) Ayrı bir terminalde Vite dev server
npm run dev
```

`.env.example`'a göre `.env.local` dosyanı doldur:

```ini
VITE_CONVEX_URL=          # npx convex dev otomatik doldurur
VITE_VAPID_PUBLIC_KEY=    # Web Push için VAPID public key
```

Web Push anahtarları üretmek için:

```bash
node -e "import('web-push').then(({default:wp}) => console.log(wp.generateVAPIDKeys()))"
```

Üretilen değerleri Convex deployment ortamına yaz:

```bash
npx convex env set VAPID_PUBLIC_KEY  <publicKey>
npx convex env set VAPID_PRIVATE_KEY <privateKey>
npx convex env set VAPID_SUBJECT     "mailto:senin@email.com"
```

---

## 🧪 Test & Kalite Kontrol

```bash
npm run test         # Vitest unit testler (tek seferlik)
npm run test:watch   # İzleme modu
npm run lint         # ESLint
npm run build        # Üretim derlemesi
npm run screenshots  # README ekran görüntülerini yeniden üret (Playwright)
```

Her push ve PR'de GitHub Actions otomatik olarak test + build çalıştırır (`.github/workflows/ci.yml`).

---

## 📁 Proje Yapısı

```
.
├─ convex/              # Backend (Convex)
│  ├─ schema.ts         # DB şeması (pets, records, weights, ...)
│  ├─ pets.ts           # Pet CRUD (auth'lu)
│  ├─ records.ts        # Bakım kaydı CRUD
│  ├─ weights.ts        # Ağırlık CRUD
│  ├─ files.ts          # Storage upload URL
│  ├─ backup.ts         # Toplu içe aktarma (yedek + demo)
│  ├─ auth.ts           # Convex Auth (Password + Anonymous)
│  ├─ users.ts          # viewer query, updateName
│  ├─ push.ts           # Web Push abonelik + manuel test
│  ├─ reminders.ts      # Günlük tarama action (Node runtime)
│  └─ crons.ts          # Scheduled jobs
├─ src/
│  ├─ pages/            # LandingPage, HomePage, PetDetailPage, ...
│  ├─ components/       # Pet, Record, Weight, Vet, Layout, UI
│  ├─ context/          # AuthContext, PetContext
│  ├─ hooks/            # useNotifications, useConfetti, ...
│  ├─ utils/            # dateHelpers + testleri
│  └─ i18n/             # tr + en
├─ public/              # PWA manifest, sw.js, ikonlar
├─ scripts/             # screenshots.mjs
└─ .github/workflows/   # ci.yml
```

---

## 👨‍💻 Geliştirici

**Yusuf Koşar**
