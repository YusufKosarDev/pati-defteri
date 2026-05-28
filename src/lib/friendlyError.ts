// AuthContext ve PetContext'te tekrarlanan Convex hata mesajı çözümlemesi.
// Convex hatası "...Uncaught Error: <mesaj>\n at..." formatında gelir; bu helper
// anlamlı kısmı çıkarır, bulamazsa `fallback` döner.

export function friendlyError(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : "";
  const m = raw.match(/(?:Uncaught\s+)?(?:Convex)?Error:\s*([^\n]+)/i);
  return m?.[1]?.trim() || fallback;
}
