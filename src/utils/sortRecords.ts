interface SortableRecord {
  date: string;
  order?: number;
}

/**
 * Kayıtları görüntüleme sırasına dizer:
 * - Kullanıcı sürükle-bırak ile manuel sıralama yaptıysa (`order` alanı dolu)
 *   ona göre artan sırada gösterilir; sonradan eklenen sırasız kayıtlar sona düşer.
 * - Hiç manuel sıralama yoksa tarihe göre (en yeni önce) sıralanır.
 */
export function sortRecordsForDisplay<T extends SortableRecord>(records: T[]): T[] {
  const hasManualOrder = records.some((r) => r.order != null);
  return [...records].sort((a, b) => {
    if (hasManualOrder) {
      return (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}
