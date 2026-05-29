// PatiDefteri için ekran görüntüleri üretir.
//
// Çalışma modları:
//   1) Default — canlı Vercel URL'ini hedefler:
//        npm run screenshots
//   2) Özel URL — `SCREENSHOTS_BASE_URL` env var:
//        SCREENSHOTS_BASE_URL=https://pati-defteri-git-foo.vercel.app npm run screenshots
//   3) Lokal — `http://localhost:5173` verilirse Vite dev'i otomatik başlatır.
//      ÖNEMLI: Convex backend ayrı terminalde `npx convex dev` ile çalışıyor olmalı.
//        SCREENSHOTS_BASE_URL=http://localhost:5173 npm run screenshots
//
// Veri seed yöntemi: misafir oturumu açıyor; HomePage useEffect'i misafir +
// boş pets durumunda `useLoadDemoData`'yı otomatik tetikler ve `convex/backup.ts`
// `replaceAll` mutation'ı 2 pet + 8 kayıt + 8 ağırlık ekler. Demo veriler gerçek
// Convex backend'inde oluşur, screenshot'lar gerçek render'ı yansıtır.

import { spawn } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const BASE_URL = process.env.SCREENSHOTS_BASE_URL || "https://pati-defteri.vercel.app";
const IS_LOCAL = BASE_URL.startsWith("http://localhost");
const VIEWPORT = { width: 1440, height: 900 };
const DEVICE_SCALE = 2;

const ANSI_RE = /\x1b\[[0-9;]*m/g;

function waitForVitePort(child, maxMs = 60000) {
  return new Promise((resolve, reject) => {
    let buf = "";
    const timer = setTimeout(() => reject(new Error(`Vite ${maxMs}ms içinde Local URL yazmadı`)), maxMs);
    const onData = (chunk) => {
      const text = chunk.toString();
      process.stdout.write(`  [vite] ${text}`);
      buf += text.replace(ANSI_RE, "");
      const m = buf.match(/Local:\s+https?:\/\/localhost:(\d+)/);
      if (m) {
        clearTimeout(timer);
        child.stdout.off("data", onData);
        resolve(Number(m[1]));
      }
    };
    child.stdout.on("data", onData);
  });
}

async function waitForServer(url, maxMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 304) return;
    } catch {}
    await wait(300);
  }
  throw new Error(`Server ${url} adresinde ${maxMs}ms içinde 200 vermedi`);
}

async function captureLanding(page, base) {
  console.log(`→ landing (${base}/)`);
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("h1", { timeout: 15_000 });
  await wait(1500);
  await page.screenshot({ path: path.join(ROOT, "screenshot-landing.png"), fullPage: false });
  console.log("  ✓ screenshot-landing.png");
}

async function loginAsGuest(page, base) {
  console.log(`→ /auth → misafir login`);
  await page.goto(`${base}/auth`, { waitUntil: "networkidle" });
  // Misafir butonu i18n metni: "👤 Misafir olarak devam et" / "👤 Continue as Guest"
  const guestBtn = page.getByRole("button", { name: /Misafir|Guest/i });
  await guestBtn.click();
  // Auth + redirect + demo data yüklenmesi için bekle. HomePage useEffect bir
  // mutation tetikler; pets listesi gözükene kadar bekleyelim.
  await page.waitForURL(/\/app$/, { timeout: 20_000 });
  console.log("  → /app, demo data bekleniyor (max 60s)...");
  // Demo data flow: anonim signIn → replaceAll mutation → listForUser refetch.
  // Convex latency'sine göre 10-30s sürer. h3'te pet adı görünene kadar bekle.
  await page.waitForSelector("h3:has-text(\"Karamel\"), h3:has-text(\"Pamuk\")", { timeout: 60_000 });
  await wait(2000); // animasyonlar otursun
}

async function captureHome(page) {
  console.log("→ home (/app)");
  await page.screenshot({ path: path.join(ROOT, "screenshot-home.png"), fullPage: false });
  console.log("  ✓ screenshot-home.png");
}

async function captureDetail(page) {
  console.log("→ detail (Pamuk)");
  // /app'te h3 yalnızca PetCard'larda görünür (HomePage stat'leri <p> kullanır,
  // PetList başlığı <h2>'dir). Yani h3 sırası pet kart sırasına = "Kayıtlar"
  // butonu sırasına eşittir. Pamuk'un h3 index'ini bulup aynı index'teki butona tıkla.
  const h3Texts = (await page.locator("h3").allTextContents()).map((t) => t.trim());
  const pamukIdx = h3Texts.indexOf("Pamuk");
  if (pamukIdx === -1) {
    throw new Error(`Pamuk kartı bulunamadı. Görünen h3'ler: ${JSON.stringify(h3Texts)}`);
  }
  const recordsBtn = page.getByRole("button", { name: /^Kayıtlar$|^Records$/ }).nth(pamukIdx);
  await recordsBtn.scrollIntoViewIfNeeded();
  await recordsBtn.click();
  await page.waitForURL(/\/pets\//, { timeout: 15_000 });
  await page.waitForSelector('h2:has-text("Pamuk")', { timeout: 15_000 });
  await wait(1500);
  await page.screenshot({ path: path.join(ROOT, "screenshot-detail.png"), fullPage: false });
  console.log("  ✓ screenshot-detail.png");
}

async function captureSimple(page, base, route, uniqueSelector, file) {
  console.log(`→ ${file.replace("screenshot-", "").replace(".png", "")} (${route})`);
  await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
  // Lazy-chunk yüklenip route render edilene kadar bekle. Selector navbar'da
  // değil sadece o sayfada görünen bir öğe olmalı (navbar her sayfada aynı).
  await page.waitForSelector(uniqueSelector, { timeout: 20_000 });
  await wait(1500);
  await page.screenshot({ path: path.join(ROOT, file), fullPage: false });
  console.log(`  ✓ ${file}`);
}

async function main() {
  let vite = null;
  let resolvedBase = BASE_URL;

  if (IS_LOCAL) {
    console.log("→ Lokal mod: Vite dev başlatılıyor. Convex backend'in `npx convex dev` ile çalışıyor olduğunu varsayıyoruz.");
    vite = spawn("npm", ["run", "dev"], { cwd: ROOT, shell: true, stdio: ["ignore", "pipe", "pipe"] });
    vite.stderr.on("data", (d) => process.stderr.write(`  [vite!] ${d}`));
    const port = await waitForVitePort(vite);
    resolvedBase = `http://localhost:${port}`;
  }

  console.log(`→ Hedef: ${resolvedBase}`);
  await waitForServer(`${resolvedBase}/`);

  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: DEVICE_SCALE,
      locale: "tr-TR",
    });
    // Misafir oturumu temiz başlasın: onboarding'i atla, demo modal'ı engelle
    await context.addInitScript(() => {
      localStorage.setItem("onboarding_seen", "true");
      localStorage.setItem("language", JSON.stringify("tr"));
    });

    const page = await context.newPage();
    await captureLanding(page, resolvedBase);
    await loginAsGuest(page, resolvedBase);
    await captureHome(page);
    await captureDetail(page);
    // Her sayfa için lazy-load'dan sonra render edilen sayfa-spesifik bir
    // selector kullan (navbar link metni yetersiz — her sayfada görünür).
    await captureSimple(page, resolvedBase, "/stats", "text=Toplam Hayvan", "screenshot-stats.png");
    await captureSimple(page, resolvedBase, "/calendar", "h1:has-text(\"Aşı Takvimi\")", "screenshot-calendar.png");
    await captureSimple(page, resolvedBase, "/settings", "text=Profil", "screenshot-settings.png");
  } finally {
    await browser.close();
    if (vite) {
      console.log("→ Vite dev kapatılıyor...");
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", vite.pid, "/f", "/t"], { shell: true });
      } else {
        vite.kill("SIGTERM");
      }
    }
  }

  console.log("✓ Tüm ekran görüntüleri üretildi.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
