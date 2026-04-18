import i18n from "../i18n/index.js";

export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const isEN = i18n.language === "en";
  return date.toLocaleDateString(isEN ? "en-US" : "tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function getDaysUntil(dateString) {
  if (!dateString) return null;
  const today = new Date();
  const target = new Date(dateString);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff;
}

export function isOverdue(dateString) {
  return getDaysUntil(dateString) < 0;
}

export function isUpcoming(dateString, withinDays = 30) {
  const days = getDaysUntil(dateString);
  return days !== null && days >= 0 && days <= withinDays;
}

export function calculateAge(birthDateString) {
  if (!birthDateString) return null;
  const birth = new Date(birthDateString);
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

export function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function getAvatarGradient(name) {
  if (!name) return AVATAR_GRADIENTS[0];
  const index = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}