// TR ↔ EN kayıt tipi eşleştirmeleri. Aramada kullanıcı hangi dilde yazarsa
// yazsın her iki dildeki kayıtların eşleşmesi için her iki varyantı döndürür.
const TYPE_PAIRS = [
  ["Karma Aşı", "Mixed Vaccine"],
  ["Kuduz Aşısı", "Rabies Vaccine"],
  ["Parazit Damlası", "Parasite Drop"],
  ["Pire İlacı", "Flea Medicine"],
  ["Kurtluk İlacı", "Dewormer"],
  ["Veteriner Ziyareti", "Vet Visit"],
  ["Diğer", "Other"],
];

const ALIASES = new Map();
for (const pair of TYPE_PAIRS) {
  for (const variant of pair) {
    ALIASES.set(variant, pair);
  }
}

export function getTypeAliases(type) {
  if (!type) return [];
  return ALIASES.get(type) ?? [type];
}

export function matchesType(type, query) {
  if (!type || !query) return false;
  const q = query.toLowerCase();
  return getTypeAliases(type).some((alias) => alias.toLowerCase().includes(q));
}
