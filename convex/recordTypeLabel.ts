// Frontend `src/utils/recordTypes.ts` ile aynı anahtar setini paylaşır.
// Cron/push/e-posta bildirimleri zaten Türkçe sabit ifadeler içerdiği için
// burada da TR etiket döneriz; yeni kayıtlar (anahtar) anlamlı metin olarak
// görünür, eski lokalize değerler ise olduğu gibi geri verilir.

const TR_LABELS: Record<string, string> = {
  mixed_vaccine: "Karma Aşı",
  rabies: "Kuduz Aşısı",
  parasite_drop: "Parazit Damlası",
  flea: "Pire İlacı",
  dewormer: "Kurtluk İlacı",
  vet_visit: "Veteriner Ziyareti",
  other: "Diğer",
};

export function recordTypeLabelTR(stored: string | undefined | null): string {
  if (!stored) return "Diğer";
  return TR_LABELS[stored] ?? stored;
}
