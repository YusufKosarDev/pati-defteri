// Pet türü artık kararlı bir anahtar olarak saklanır ("cat"/"dog"/"other").
// Görüntüleme dile göre `petTypeLabel` ile çevrilir. `normalizePetType` hem yeni
// anahtarları hem de eski lokalize değerleri (Kedi/Cat ...) anahtara indirger;
// böylece eski kayıtlar, yedekler ve demo verisi geriye dönük çalışır.

export type PetTypeKey = "cat" | "dog" | "other";

export const PET_TYPE_KEYS: readonly PetTypeKey[] = ["cat", "dog", "other"];

const PET_TYPE_ALIASES: Record<string, PetTypeKey> = {
  cat: "cat",
  kedi: "cat",
  dog: "dog",
  köpek: "dog",
  kopek: "dog",
  other: "other",
  diğer: "other",
  diger: "other",
};

export function normalizePetType(stored?: string | null): PetTypeKey {
  if (!stored) return "other";
  return PET_TYPE_ALIASES[stored.toLowerCase()] ?? "other";
}

const PET_TYPE_LABELS: Record<PetTypeKey, { tr: string; en: string }> = {
  cat: { tr: "Kedi", en: "Cat" },
  dog: { tr: "Köpek", en: "Dog" },
  other: { tr: "Diğer", en: "Other" },
};

export function petTypeLabel(key: PetTypeKey, isEN: boolean): string {
  const label = PET_TYPE_LABELS[key];
  return isEN ? label.en : label.tr;
}

export function petTypeEmoji(key: PetTypeKey): string {
  return key === "cat" ? "🐱" : key === "dog" ? "🐶" : "🐾";
}

/** Arama: anahtarı her iki dildeki etiket veya anahtarın kendisi ile eşleştirir. */
export function petTypeMatches(key: PetTypeKey, query: string): boolean {
  const q = query.toLowerCase();
  const label = PET_TYPE_LABELS[key];
  return key.includes(q) || label.tr.toLowerCase().includes(q) || label.en.toLowerCase().includes(q);
}
