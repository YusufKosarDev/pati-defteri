# Özet

<!-- PR'ın neyi değiştirdiğini 1-3 cümlede anlat. "Neden" hep "ne" den daha önemli. -->

## Yapılan değişiklik

<!-- Madde madde teknik özet. Diff'i okurken aklında olması gerekenler. -->

-
-

## Self-review kontrol listesi

Merge etmeden önce diff'i kendin oku ve aşağıdakileri her bir madde için kendine sor:

### Kod
- [ ] Her satıra "bu satır neden burada?" sorusunu sordum, bir gerekçesi var
- [ ] Console.log, debugger, TODO/FIXME yorumları kalmadı
- [ ] Yeni komponentler render içinde tanımlanmadı (top-level)
- [ ] `useEffect` deps'i tam, gerçekten gerekli olmayan effect yok
- [ ] `useState` ile `useMemo` gerekmiyor mu kontrol ettim (derived state)
- [ ] Yeni magic number / string yok, sabit/i18n key kullanıldı

### Güvenlik
- [ ] Yeni Convex mutation/query `requireUser` veya `requireOwnedX` çağırıyor
- [ ] Kullanıcı input'u doğrulanıyor (length, format, allowlist)
- [ ] Hassas veri (token, key) commit'e girmedi

### Test & lint
- [ ] `npm run lint` 0 hata
- [ ] `npm run typecheck` 0 hata
- [ ] `npm test` tüm testler geçiyor
- [ ] Yeni feature için en az 1 entegrasyon testi yazıldı
- [ ] Kırılgan davranış (auth/ownership/cascade) test ile sabitlendi

### UI/UX
- [ ] Dev server'da bizzat tarayıcıda test ettim, sadece tip değil davranış doğru
- [ ] Mobil viewport'ta da kontrol ettim
- [ ] Loading + error state'ler düşünüldü
- [ ] TR ve EN metinler eklendi (i18n)

### Performans
- [ ] Render içinde pahalı işlem (sort, filter, JSON.parse) yok; gerekiyorsa `useMemo`
- [ ] Liste `key` prop'u stable id (array index değil)
- [ ] Convex query/mutation çağrı sayısı makul

## Test planı

<!-- Reviewer veya kendin nasıl test edersin? Adım adım. -->

1.
2.
3.

## Riskler ve geri alma

<!-- Bu PR neyi kırabilir? Kırılırsa nasıl geri alınır? -->

-

## Ekran görüntüsü / GIF

<!-- UI değişikliği varsa ekle. -->
