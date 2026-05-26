import { test, expect } from "@playwright/test";

// Backend-bağımsız smoke testi: routing, lazy-load, i18n ve temel render.
// Auth akışının kendisi (gerçek giriş) burada test edilmez — bkz. README.

test("landing sayfası yüklenir ve uygulamaya giriş butonu görünür", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/PatiDefteri/i);
  await expect(page.getByRole("button", { name: /Uygulamaya Gir|Enter App/i }).first()).toBeVisible();
});

test("landing'den auth sayfasına gidilir ve giriş formu görünür", async ({ page }) => {
  await page.goto("/auth");
  // Giriş / Kayıt sekmeleri
  await expect(page.getByRole("button", { name: /^Giriş Yap$|^Login$/i }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /^Kayıt Ol$|^Register$/i }).first()).toBeVisible();
  // Misafir girişi seçeneği
  await expect(
    page.getByRole("button", { name: /Misafir olarak devam et|Continue as Guest/i })
  ).toBeVisible();
});

test("bilinmeyen rota 404 sayfası gösterir", async ({ page }) => {
  await page.goto("/var-olmayan-sayfa");
  await expect(page.getByText(/404|bulunamadı|not found/i).first()).toBeVisible();
});
