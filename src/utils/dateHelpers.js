export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
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

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years === 0) {
    return `${months} aylık`;
  } else if (months === 0) {
    return `${years} yaşında`;
  } else {
    return `${years} yaş ${months} ay`;
  }
}

export function getAvatarColor(name) {
  const colors = [
    "bg-emerald-400", "bg-sky-400", "bg-violet-400",
    "bg-pink-400", "bg-orange-400", "bg-teal-400",
    "bg-rose-400", "bg-indigo-400",
  ];
  const index = name?.charCodeAt(0) % colors.length || 0;
  return colors[index];
}