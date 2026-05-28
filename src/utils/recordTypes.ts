// Kayıt türü kararlı bir anahtar olarak saklanır ("mixed_vaccine" ...).
// Görüntüleme dile göre `recordTypeLabel` ile çevrilir. `normalizeRecordType`
// hem yeni anahtarları hem de eski lokalize değerleri (TR/EN) anahtara indirger;
// böylece eski kayıtlar, yedekler ve demo verisi geriye dönük çalışır.

export type RecordTypeKey =
  | "mixed_vaccine"
  | "rabies"
  | "parasite_drop"
  | "flea"
  | "dewormer"
  | "vet_visit"
  | "other";

const RECORD_TYPES: ReadonlyArray<{ key: RecordTypeKey; tr: string; en: string }> = [
  { key: "mixed_vaccine", tr: "Karma Aşı", en: "Mixed Vaccine" },
  { key: "rabies", tr: "Kuduz Aşısı", en: "Rabies Vaccine" },
  { key: "parasite_drop", tr: "Parazit Damlası", en: "Parasite Drop" },
  { key: "flea", tr: "Pire İlacı", en: "Flea Medicine" },
  { key: "dewormer", tr: "Kurtluk İlacı", en: "Dewormer" },
  { key: "vet_visit", tr: "Veteriner Ziyareti", en: "Vet Visit" },
  { key: "other", tr: "Diğer", en: "Other" },
];

export const RECORD_TYPE_KEYS: readonly RecordTypeKey[] = RECORD_TYPES.map((t) => t.key);

const NORMALIZE = new Map<string, RecordTypeKey>();
for (const t of RECORD_TYPES) {
  NORMALIZE.set(t.key, t.key);
  NORMALIZE.set(t.tr.toLowerCase(), t.key);
  NORMALIZE.set(t.en.toLowerCase(), t.key);
}

export function normalizeRecordType(stored?: string | null): RecordTypeKey {
  if (!stored) return "other";
  return NORMALIZE.get(stored.toLowerCase()) ?? "other";
}

export function recordTypeLabel(key: RecordTypeKey, isEN: boolean): string {
  const t = RECORD_TYPES.find((x) => x.key === key);
  if (!t) return key;
  return isEN ? t.en : t.tr;
}

/** Arama: anahtarı her iki dildeki etiket veya anahtarın kendisi ile eşleştirir. */
export function matchesRecordType(key: RecordTypeKey, query: string): boolean {
  const q = query.toLowerCase();
  const t = RECORD_TYPES.find((x) => x.key === key);
  if (!t) return false;
  return t.key.includes(q) || t.tr.toLowerCase().includes(q) || t.en.toLowerCase().includes(q);
}
