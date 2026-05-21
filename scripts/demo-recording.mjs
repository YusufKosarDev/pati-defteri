// Otomatik demo videosu — LinkedIn paylaşımı için
//
// Kullanım:
//   1) Production URL'i kayıt et (varsayılan):
//        npm run demo:record
//   2) Lokal dev server'ı kayıt et:
//        TARGET=http://localhost:5173 npm run demo:record
//
// Çıktı: scripts/output/demo-recording.webm
//        Convert to MP4/GIF for LinkedIn:
//          ffmpeg -i scripts/output/demo-recording.webm -c:v libx264 -preset slow -crf 22 demo.mp4
//          ffmpeg -i demo.mp4 -vf "fps=15,scale=720:-1:flags=lanczos" -loop 0 demo.gif

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TARGET = process.env.TARGET || "https://pati-defteri.vercel.app";
const OUT_DIR = resolve(__dirname, "output");
mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 720 } },
  locale: "tr-TR",
});
const page = await context.newPage();

console.log("🎬 Recording started, target:", TARGET);

// 1) Landing
await page.goto(TARGET, { waitUntil: "networkidle" });
await sleep(2500);
await page.evaluate(() => window.scrollBy({ top: 500, behavior: "smooth" }));
await sleep(2000);
await page.evaluate(() => window.scrollBy({ top: 800, behavior: "smooth" }));
await sleep(2000);
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
await sleep(1500);

// 2) Auth — misafir login
await page.getByRole("button", { name: /Uygulamayı Aç|Enter App/i }).first().click().catch(() => {});
await page.waitForURL("**/auth", { timeout: 5000 }).catch(() => {});
await sleep(1500);
await page.getByRole("button", { name: /Misafir|Guest/i }).click().catch(() => {});
await page.waitForURL("**/app", { timeout: 10000 }).catch(() => {});

// 3) Onboarding'i geç + demo data yüklenmesini bekle
await sleep(2000);
for (let i = 0; i < 5; i++) {
  await page.getByRole("button", { name: /Sonraki|Next|Başla|Start/i }).first().click().catch(() => {});
  await sleep(900);
}
await sleep(3000); // demo data yüklenme

// 4) Anasayfa tur
await page.evaluate(() => window.scrollBy({ top: 400, behavior: "smooth" }));
await sleep(2000);

// 5) Bir pet'e tıkla → detay
await page.locator("button:has-text('Kayıtlar'), button:has-text('Records')").first().click().catch(() => {});
await sleep(2500);
// Weight tab
await page.getByRole("button", { name: /Ağırlık|Weight/i }).first().click().catch(() => {});
await sleep(2500);
// Vet tab
await page.getByRole("button", { name: /Veteriner|Vet/i }).first().click().catch(() => {});
await sleep(2000);
// Back
await page.getByRole("button", { name: /Geri|Back/i }).first().click().catch(() => {});
await sleep(1500);

// 6) Calendar
await page.goto(`${TARGET}/calendar`, { waitUntil: "networkidle" });
await sleep(2500);

// 7) Stats
await page.goto(`${TARGET}/stats`, { waitUntil: "networkidle" });
await sleep(3500);

// 8) Settings (kısa görünüm)
await page.goto(`${TARGET}/settings`, { waitUntil: "networkidle" });
await sleep(2000);

console.log("🎬 Recording complete, finalizing...");
await context.close();
await browser.close();

console.log(`\n✅ Saved to ${OUT_DIR}/`);
console.log(`   Convert to MP4: ffmpeg -i scripts/output/*.webm -c:v libx264 -preset slow -crf 22 demo.mp4`);
console.log(`   Convert to GIF: ffmpeg -i demo.mp4 -vf "fps=15,scale=720:-1:flags=lanczos" -loop 0 demo.gif`);
