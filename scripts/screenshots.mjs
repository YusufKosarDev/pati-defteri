import { spawn } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const VIEWPORT = { width: 1440, height: 900 };
const DEVICE_SCALE = 2;

function daysFromNow(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function yearsAgo(years, monthOffset = 0) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setMonth(d.getMonth() + monthOffset);
  return d.toISOString().slice(0, 10);
}

const USER_ID = "demo_user_screenshot";
const SAFE_USER = { id: USER_ID, name: "Yusuf", email: "demo@patidefteri.app", isGuest: false };

const PETS = [
  {
    id: "demo_pet_1",
    name: "Pamuk",
    type: "Kedi",
    breed: "Van Kedisi",
    birthDate: yearsAgo(3, 2),
    photo: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop",
    notes: "Çok sevecen, oyun sever.",
    vets: [{
      clinicName: "Dostlar Veteriner Kliniği",
      doctorName: "Dr. Ayşe Yılmaz",
      phone: "0532 123 45 67",
      address: "Kadıköy, İstanbul",
      notes: "Acil durumda ara",
    }],
  },
  {
    id: "demo_pet_2",
    name: "Karamel",
    type: "Köpek",
    breed: "Golden Retriever",
    birthDate: yearsAgo(4, -3),
    photo: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop",
    notes: "Çok enerjik, parkta oynamayı sever.",
    vets: [{
      clinicName: "Pati Veteriner Merkezi",
      doctorName: "Dr. Mehmet Kaya",
      phone: "0533 987 65 43",
      address: "Beşiktaş, İstanbul",
      notes: "Salı günleri kapalı",
    }],
  },
];

const RECORDS = [
  { id: "r1", petId: "demo_pet_1", type: "Karma Aşı", date: daysFromNow(-380), nextDate: daysFromNow(-15), notes: "Yıllık karma aşı yapıldı." },
  { id: "r2", petId: "demo_pet_1", type: "Kuduz Aşısı", date: daysFromNow(-380), nextDate: daysFromNow(-15), notes: "" },
  { id: "r3", petId: "demo_pet_1", type: "Parazit Damlası", date: daysFromNow(-75), nextDate: daysFromNow(15), notes: "Frontline Plus kullanıldı." },
  { id: "r4", petId: "demo_pet_1", type: "Veteriner Ziyareti", date: daysFromNow(-180), nextDate: "", notes: "Genel kontrol, her şey normal." },
  { id: "r5", petId: "demo_pet_2", type: "Karma Aşı", date: daysFromNow(-300), nextDate: daysFromNow(65), notes: "Yıllık aşılar yapıldı." },
  { id: "r6", petId: "demo_pet_2", type: "Kuduz Aşısı", date: daysFromNow(-300), nextDate: daysFromNow(65), notes: "" },
  { id: "r7", petId: "demo_pet_2", type: "Kurtluk İlacı", date: daysFromNow(-85), nextDate: daysFromNow(5), notes: "Drontal Plus verildi." },
  { id: "r8", petId: "demo_pet_2", type: "Parazit Damlası", date: daysFromNow(-30), nextDate: daysFromNow(60), notes: "" },
];

const WEIGHTS = [
  { id: "w1", petId: "demo_pet_1", weight: "3.8", date: daysFromNow(-330), notes: "" },
  { id: "w2", petId: "demo_pet_1", weight: "3.9", date: daysFromNow(-240), notes: "" },
  { id: "w3", petId: "demo_pet_1", weight: "4.1", date: daysFromNow(-150), notes: "Biraz kilo aldı" },
  { id: "w4", petId: "demo_pet_1", weight: "4.0", date: daysFromNow(-60), notes: "" },
  { id: "w5", petId: "demo_pet_2", weight: "28.5", date: daysFromNow(-330), notes: "" },
  { id: "w6", petId: "demo_pet_2", weight: "29.0", date: daysFromNow(-240), notes: "" },
  { id: "w7", petId: "demo_pet_2", weight: "29.8", date: daysFromNow(-150), notes: "" },
  { id: "w8", petId: "demo_pet_2", weight: "30.2", date: daysFromNow(-60), notes: "Hafif fazla, diyet başlandı" },
];

const PAGES = [
  { name: "landing", url: "/", waitFor: "h1", out: "screenshot-landing.png" },
  { name: "home", url: "/app", waitFor: "text=Hayvanlarım", out: "screenshot-home.png" },
  { name: "detail", url: "/pets/demo_pet_1", waitFor: "text=Pamuk", out: "screenshot-detail.png" },
  { name: "stats", url: "/stats", waitFor: "text=İstatistikler", out: "screenshot-stats.png" },
  { name: "calendar", url: "/calendar", waitFor: "text=Aşı Takvimi", out: "screenshot-calendar.png" },
  { name: "settings", url: "/settings", waitFor: "text=Ayarlar", out: "screenshot-settings.png" },
];

const ANSI_RE = /\[[0-9;]*m/g;

function waitForVitePort(child, maxMs = 60000) {
  return new Promise((resolve, reject) => {
    let buf = "";
    const timer = setTimeout(() => {
      reject(new Error(`Vite ${maxMs}ms içinde Local URL yazmadı`));
    }, maxMs);
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
  throw new Error(`Dev server ${url} adresinde ${maxMs}ms içinde 200 vermedi`);
}

async function main() {
  console.log("→ Vite dev server başlatılıyor (strictPort yok, müsait portu bul)...");
  const vite = spawn("npm", ["run", "dev"], {
    cwd: ROOT,
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  vite.stderr.on("data", (d) => process.stderr.write(`  [vite!] ${d}`));

  try {
    const port = await waitForVitePort(vite);
    const base = `http://localhost:${port}`;
    console.log(`→ Vite portu: ${port}`);
    await waitForServer(`${base}/`);
    console.log("→ Server hazır, Chromium açılıyor...");

    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: DEVICE_SCALE,
      locale: "tr-TR",
    });

    await context.addInitScript((payload) => {
      const { user, pets, records, weights, userId } = payload;
      localStorage.setItem("current_user", JSON.stringify(user));
      localStorage.setItem(`pets_${userId}`, JSON.stringify(pets));
      localStorage.setItem(`records_${userId}`, JSON.stringify(records));
      localStorage.setItem(`weights_${userId}`, JSON.stringify(weights));
      localStorage.setItem("onboarding_seen", "true");
      localStorage.setItem(`demo_shown_${userId}`, "true");
      localStorage.setItem("language", "tr");
    }, { user: SAFE_USER, pets: PETS, records: RECORDS, weights: WEIGHTS, userId: USER_ID });

    const page = await context.newPage();

    for (const p of PAGES) {
      console.log(`→ ${p.name} (${p.url})`);
      await page.goto(`${base}${p.url}`, { waitUntil: "networkidle" });
      try {
        await page.waitForSelector(p.waitFor, { timeout: 10000 });
      } catch {
        console.warn(`  uyarı: '${p.waitFor}' seçicisi bulunamadı, yine de çekiliyor`);
      }
      await wait(1200);
      const outPath = path.join(ROOT, p.out);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`  ✓ ${p.out}`);
    }

    await browser.close();
  } finally {
    console.log("→ Dev server kapatılıyor...");
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", vite.pid, "/f", "/t"], { shell: true });
    } else {
      vite.kill("SIGTERM");
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
