// Sunucu tarafı uzunluk doğrulaması. Convex `v.string()` yalnızca tipi doğrular,
// uzunluğu değil; bu yüzden kötüye kullanımı (devasa string'ler) ve DB satır
// şişmesini engellemek için alan başına makul üst sınırlar uygularız.

export const TEXT_LIMITS = {
  name: 100,
  type: 50,
  breed: 100,
  notes: 2000,
  weight: 20,
  date: 40,
  nextDate: 40,
  birthDate: 40,
  clinicName: 150,
  doctorName: 150,
  phone: 40,
  address: 300,
  // Legacy base64 data URL'lerine (geriye dönük içe aktarma) izin verecek kadar
  // cömert; URL modunda zaten kısa kalır. Yine de absürt yükleri reddeder.
  photo: 8_000_000,
} as const;

type LimitedField = keyof typeof TEXT_LIMITS;

/**
 * Verilen nesnedeki bilinen string alanların uzunluklarını doğrular. Tanımlı
 * limiti olmayan alanlar (id, bayrak, vb.) yok sayılır.
 */
export function assertTextLimits(fields: Record<string, unknown>): void {
  for (const key of Object.keys(fields)) {
    const max = TEXT_LIMITS[key as LimitedField];
    if (max === undefined) continue;
    const value = fields[key];
    if (typeof value === "string" && value.length > max) {
      throw new Error(`"${key}" alanı en fazla ${max} karakter olabilir.`);
    }
  }
}

/** Veteriner dizisindeki her nesnenin metin alanlarını doğrular. */
export function assertVetLimits(vets: readonly unknown[] | undefined): void {
  if (!vets) return;
  for (const vet of vets) {
    if (vet && typeof vet === "object") {
      assertTextLimits(vet as Record<string, unknown>);
    }
  }
}
