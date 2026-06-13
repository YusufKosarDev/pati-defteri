# 🐾 PatiDefteri

> A fullstack web application that allows you to track your pets' vaccination, care, and health history in one place.

[![CI](https://github.com/YusufKosarDev/pati-defteri/actions/workflows/ci.yml/badge.svg)](https://github.com/YusufKosarDev/pati-defteri/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Convex](https://img.shields.io/badge/Convex-backend-EE342F)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8)
![Lighthouse](https://img.shields.io/badge/Best%20Practices-100-brightgreen)

**🌐 Live Demo:** [pati-defteri.vercel.app](https://pati-defteri.vercel.app)

> 💡 **"Continue as Guest"** to try the demo instantly — sample pets and records will be loaded automatically.

---

## 🌐 Languages
- [Turkish Version / Türkçe Sürüm](README.md)

---

## 📸 Screenshots

### 🏠 Landing Page
![Landing Page](screenshot-landing.png)

### 🐾 Home Page — My Pets
![Home Page](screenshot-home.png)

### 🐶 Pet Details — Records
![Pet Details](screenshot-detail.png)

### 📊 Statistics
![Statistics](screenshot-stats.png)

### 📅 Vaccine Calendar
![Calendar](screenshot-calendar.png)

### ⚙️ Settings
![Settings](screenshot-settings.png)

---

## ✨ Features

### 🔐 Accounts & Syncing
- Register and login with email / password.
- Guest mode (single-click access for quick testing).
- Multi-device real-time sync — changes made in one browser appear instantly in another.

### 🐶 Pet Management
- Custom profiles for cats, dogs, and other pets.
- Photo uploads, breed info, date of birth, and notes.
- Automatic age calculation.
- Colorful letter-based avatar generator (if no photo is uploaded).
- Search by name, multiple sorting options.
- Track multiple veterinarians' contact details.

### 💉 Vaccine & Care Tracking
- Manage vaccines (Core, Rabies, etc.), deworming, flea treatments, and custom cares.
- Future care date reminders.
- Warning system for overdue and upcoming cares.
- Server-persisted drag & drop record reordering.
- Filter records by category type.

### ⚖️ Weight Tracking
- Interactive line charts tracking weight changes over time.

### 📊 Stats & Calendar
- Monthly record charts, pet type distribution, and records comparison per pet.
- Clean monthly calendar view of all upcoming/past cares.

### 🔔 Server-Triggered Push Notifications
- VAPID-based Web Push subscription lifecycle.
- Receive notifications even when the app is closed.
- Daily automated background scan (Convex cron) to alert users of upcoming and overdue cares.

### 📄 PDF Reports & 📱 QR Code Sharing
- Download complete pet health history as a PDF with a single click.
- Share your pet's health card via QR code for quick vet access.

### 💾 Data Backup
- Download / upload all pet data as JSON.
- Backwards-compatible import mechanism handling legacy data formats in a single transaction.

### 🎨 User Experience
- Sleek modern dark mode theme.
- Multi-language support (Turkish / English).
- Smooth Framer Motion animations and skeleton loading.
- Fully responsive (mobile-first) layout.
- PWA — installable on iOS, Android, and Desktop.
- Guided onboarding tour and celebratory confetti effects.
- **Accessibility (a11y):** ARIA roles/labels + focus-trap on dialogs, keyboard navigation (Esc/Tab/Enter), and automatic animation reduction using `prefers-reduced-motion`.

---

## 🏗️ Architecture

```
┌──────────────────────┐         ┌──────────────────────┐
│  React 19 + Vite     │ ◀────▶  │  Convex (Backend)    │
│  Tailwind, Recharts  │         │  • Postgres tables   │
│  Framer Motion       │         │  • Auth (Anonymous + │
│  PWA + Service Worker│         │    Password)         │
└──────────┬───────────┘         │  • Storage (photo CDN)│
           │                     │  • Actions (Node JS) │
           │                     │  • Cron (daily push) │
   Web Push (VAPID)              └──────────┬───────────┘
           │                                │
           ▼                                ▼
   Browser / Phone                web-push + Resend
```

- **Frontend:** Vite + React 19, client-side rendering with strict TypeScript.
- **Backend:** Convex — real-time relational PostgreSQL + server functions + file storage.
- **Auth:** `@convex-dev/auth` — Password & Anonymous login providers, protected by server-side ownership checks.
- **Storage:** Pet photos hosted via Convex CDN Storage. Automatically garbage-collects orphaned photos when pets are updated or deleted.
- **Backend Security:** Multi-tenant isolation using server-side ownership guards (`requireOwnedPet`, etc.). Validation of fields (`name ≤ 100`, `notes ≤ 2000`, etc.), rate limiters (`rateLimits` table), and array size checks on drag-and-drop actions.
- **Data Modeling:** Hardcoded stable keys for pet and record types (`cat`, `mixed_vaccine`, etc.). Backwards compatibility filters normalize legacy data on imports.
- **Notifications:** VAPID push subscriptions triggered from Node actions via `web-push`; daily cron scheduler.
- **Observability:** Sentry (optional) — error tracking + session replay on errors.
- **Hosting:** Vercel (frontend) + Convex cloud deployment (backend).

---

## 🛠️ Technology Stack

### Frontend
| Package | Description |
|-------|----------|
| React 19 | UI framework |
| Vite 8 | Frontend build tool |
| Tailwind CSS 4 | CSS framework |
| Framer Motion | Fluid UI animations |
| React Router v7 | Client routing |
| Recharts | Interactive SVG charts |
| i18next | Multi-language management |
| jsPDF | Dynamic PDF generation |
| @dnd-kit | Drag and drop sorting |
| qrcode.react | QR Code generator |
| canvas-confetti | UI success confetti animations |
| react-hot-toast | Toast notifications |

### Backend & Infrastructure
| Package | Description |
|-------|----------|
| Convex | Real-time database + cloud functions + storage |
| @convex-dev/auth | Passwordless & password authentication |
| web-push | VAPID push notifications |
| Resend | Transactional emails for reminders |

### Testing & Quality Assurance
| Package | Description |
|-------|----------|
| TypeScript | Type safety (strict mode, end-to-end frontend/backend types) |
| Vitest + jsdom | Fast frontend unit testing |
| React Testing Library | Component interaction & accessibility testing |
| convex-test + edge-runtime | Integration tests for auth, ownership, cascading deletes |
| Playwright | E2E smoke tests and automated screenshots |
| GitHub Actions | Automated CI (lint · typecheck · test · build) |
| ESLint | Static code analysis |
| husky + lint-staged | Pre-commit Git hooks |
| Sentry | Error logging and session replay |

---

## 🧑‍💻 Local Development

```bash
# 1) Install dependencies
npm install

# 2) Spin up Convex local development backend (handles login/project initialization on first run)
npx convex dev

# 3) In a new terminal tab, start Vite development server
npm run dev
```

Create a `.env.local` file based on `.env.example`:

```ini
VITE_CONVEX_URL=          # Automatically filled by 'npx convex dev'
VITE_VAPID_PUBLIC_KEY=    # VAPID public key for Web Push (optional)
VITE_SENTRY_DSN=          # Sentry error tracking (optional)
```

To generate Web Push keys:

```bash
node -e "import('web-push').then(({default:wp}) => console.log(wp.generateVAPIDKeys()))"
```

Then save them to your Convex deployment environment:

```bash
npx convex env set VAPID_PUBLIC_KEY  <publicKey>
npx convex env set VAPID_PRIVATE_KEY <privateKey>
npx convex env set VAPID_SUBJECT     "mailto:your@email.com"
```

---

## 🧪 Testing & Quality Assurance

```bash
npm run lint         # Check ESLint rule compliance
npm run typecheck    # Validate TypeScript compiles successfully
npm run test         # Run unit and integration tests (Vitest)
npm run test:watch   # Watch mode for Vitest
npm run e2e          # Run Playwright E2E smoke tests
npm run build        # Build production bundles
npm run screenshots  # Re-generate screenshots for README via Playwright
```

### Three-Layer Quality Gates

1.  **Pre-commit Hook** (`.husky/pre-commit`) — Automatically runs `lint-staged` (max-warnings=0) + `typecheck` + test suites on every commit. Prevents broken code from being committed.
2.  **Pull Request Template** (`.github/PULL_REQUEST_TEMPLATE.md`) — Self-review checklist covering safety, UI/UX, performance, localization, and testing.
3.  **GitHub Actions** (`.github/workflows/ci.yml`) — Automated CI running `lint`, `typecheck (src + convex)`, `test`, and `build` on every push/PR.

### Testing Architecture

Vitest is configured with two distinct test projects:
-   **`client`** (uses `jsdom`) — Unit tests for helper functions (dates, categories) and component testing (modals, validation errors).
-   **`convex`** (uses `edge-runtime`) — Integrates `convex-test` to test actual mutations/queries, auth boundaries, ownership protections, user deletion pipelines, rate limits, and push notification triggers.

Additionally, **Playwright E2E** (`e2e/`) validates routing, lazy load boundaries, and basic user flows in a real Chromium browser.

---

## 📁 Directory Structure

```
.
├─ convex/                  # Backend code (Convex server functions)
│  ├─ schema.ts             # Database schemas
│  ├─ pets.ts               # Pet CRUD + auto photo cleanup
│  ├─ records.ts            # Record CRUD + drag-drop reordering
│  ├─ weights.ts            # Weight CRUD
│  ├─ files.ts              # File upload/storage links
│  ├─ backup.ts             # JSON import/export endpoints
│  ├─ auth.ts               # Convex Auth config
│  ├─ users.ts              # User profiles
│  ├─ account.ts            # Guest upgrade, account deletion, password management
│  ├─ email.ts              # Email notifications (Resend action)
│  ├─ push.ts               # Web Push subscriptions
│  ├─ reminders.ts          # Daily background scanning action
│  ├─ crons.ts              # Background job scheduler
│  ├─ validators.ts         # Length validation helpers
│  ├─ rateLimit.ts          # API request limiter
│  └─ lib/                  # Shared backend utilities
├─ src/                     # Frontend source
│  ├─ pages/                # App pages (Landing, Home, Detail, Stats, Settings...)
│  ├─ components/           # UI elements and features
│  ├─ context/              # React Auth and Pet contexts
│  ├─ hooks/                # Custom hooks (a11y, notifications, confetti...)
│  ├─ lib/                  # Initialization (convex, sentry, PDF generator)
│  ├─ utils/                # Dates, categories, lists sorting
│  ├─ types.ts              # Shared TypeScript definitions
│  ├─ i18n/                 # Localization dictionaries (tr, en)
│  └─ vite-env.d.ts         # Environment types
├─ public/                  # Static assets & PWA manifest
├─ scripts/                 # Automated screenshot generator script
└─ .github/                 # Actions CI workflow and PR templates
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developer

**Yusuf Koşar**
