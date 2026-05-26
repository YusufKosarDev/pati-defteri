import i18n from "../i18n/index";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * "YYYY-MM-DD" string'ini YEREL gece yarısı olarak çözer. `new Date("YYYY-MM-DD")`
 * UTC gece yarısı verir; bu, UTC gerisindeki saat dilimlerinde gün kaymasına yol
 * açar. Tarih-saat içeren string'ler olduğu gibi parse edilir.
 */
export function parseLocalDate(dateString?: string | null): Date | null {
  if (!dateString) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const d = new Date(dateString);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(dateString?: string | null): string {
  const date = parseLocalDate(dateString);
  if (!date) return "";
  const isEN = i18n.language === "en";
  return date.toLocaleDateString(isEN ? "en-US" : "tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function getDaysUntil(dateString?: string | null): number | null {
  const target = parseLocalDate(dateString);
  if (!target) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  // Her iki taraf da yerel gece yarısına hizalı; round DST ±1 saat sapmasını yutar.
  return Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);
}

export function isOverdue(dateString?: string | null): boolean {
  const d = getDaysUntil(dateString);
  return d !== null && d < 0;
}

export function isUpcoming(dateString?: string | null, withinDays = 30): boolean {
  const days = getDaysUntil(dateString);
  return days !== null && days >= 0 && days <= withinDays;
}

export function calculateAge(birthDateString?: string | null): string | null {
  const birth = parseLocalDate(birthDateString);
  if (!birth) return null;
  const today = new Date();
  const isEN = i18n.language === "en";

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (isEN) {
    if (years === 0) return `${months} month${months !== 1 ? "s" : ""} old`;
    if (months === 0) return `${years} year${years !== 1 ? "s" : ""} old`;
    return `${years} yr ${months} mo`;
  } else {
    if (years === 0) return `${months} aylık`;
    if (months === 0) return `${years} yaşında`;
    return `${years} yaş ${months} ay`;
  }
}

export type BirthdayStatus =
  | { type: "today"; daysUntil: 0; age: number }
  | { type: "upcoming"; daysUntil: number; age: number };

export function getBirthdayStatus(birthDateString?: string | null): BirthdayStatus | null {
  const birth = parseLocalDate(birthDateString);
  if (!birth) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisYearBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  const diff = Math.round((thisYearBirthday.getTime() - today.getTime()) / MS_PER_DAY);
  const age = today.getFullYear() - birth.getFullYear();

  if (diff === 0) return { type: "today", daysUntil: 0, age };
  if (diff > 0 && diff <= 7) return { type: "upcoming", daysUntil: diff, age };
  if (diff < 0) {
    const nextYearBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
    const nextDiff = Math.round((nextYearBirthday.getTime() - today.getTime()) / MS_PER_DAY);
    if (nextDiff <= 7) return { type: "upcoming", daysUntil: nextDiff, age: age + 1 };
  }

  return null;
}

const AVATAR_GRADIENTS = [
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-blue-500",
  "from-violet-400 to-purple-500",
  "from-pink-400 to-rose-500",
  "from-orange-400 to-amber-500",
  "from-cyan-400 to-sky-500",
  "from-indigo-400 to-violet-500",
  "from-fuchsia-400 to-pink-500",
];

const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-fuchsia-500",
];

export function getAvatarColor(name?: string | null): string {
  if (!name) return AVATAR_COLORS[0];
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function getAvatarGradient(name?: string | null): string {
  if (!name) return AVATAR_GRADIENTS[0];
  const index = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}
