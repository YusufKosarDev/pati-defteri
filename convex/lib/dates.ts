// `remindersInternal` ve `emailInternal` arasında paylaşılan gün hesaplaması.

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Verilen tarih ile bugün arasındaki tam gün farkı (yerel gece yarısına hizalı).
 * Geçerli tarih değilse veya boşsa null döner.
 */
export function daysUntil(dateStr: string | undefined | null): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  if (Number.isNaN(target.getTime())) return null;
  return Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);
}
