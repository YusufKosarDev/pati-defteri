import { useEffect } from "react";
import { motion } from "framer-motion";
import { usePet } from "../../context/PetContext";
import { useTranslation } from "react-i18next";
import { isOverdue, isUpcoming, getDaysUntil, getBirthdayStatus } from "../../utils/dateHelpers";
import useConfetti from "../../hooks/useConfetti";

function SummaryBanner() {
  const { pets, records } = usePet();
  const { i18n } = useTranslation();
  const isEN = i18n.language === "en";
  const { fireConfetti } = useConfetti();

  // Tüm hesaplamalar hook'lardan sonra
  const overdueRecords = records.filter((r) => r.nextDate && isOverdue(r.nextDate));
  const upcomingRecords = records.filter((r) => r.nextDate && isUpcoming(r.nextDate));
  const getPetName = (petId) => pets.find((p) => p.id === petId)?.name || "";

  const birthdayPets = pets
    .map((pet) => ({ pet, status: getBirthdayStatus(pet.birthDate) }))
    .filter(({ status }) => status !== null);

  const todayBirthdays = birthdayPets.filter(({ status }) => status.type === "today");
  const upcomingBirthdays = birthdayPets.filter(({ status }) => status.type === "upcoming");

  // useEffect her zaman çağrılmalı — koşul içinde değil
  useEffect(() => {
    if (todayBirthdays.length > 0) {
      const timer = setTimeout(fireConfetti, 1000);
      return () => clearTimeout(timer);
    }
  }, [todayBirthdays.length]);

  // Early return hook'lardan SONRA
  if (pets.length === 0) return null;

  const allGood = overdueRecords.length === 0 && upcomingRecords.length === 0 && todayBirthdays.length === 0 && upcomingBirthdays.length === 0;

  if (allGood) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3"
      >
        <span className="text-2xl">✅</span>
        <div>
          <p className="font-semibold text-emerald-400">
            {isEN ? "All good!" : "Her şey yolunda!"}
          </p>
          <p className="text-sm text-emerald-500/70">
            {isEN ? "No upcoming or overdue care." : "Yaklaşan veya gecikmiş bakım yok."}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 mb-6"
    >
      {todayBirthdays.map(({ pet, status }) => (
        <motion.div
          key={pet.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🎂</span>
            <p className="font-bold text-pink-400">
              {isEN ? "Happy Birthday!" : "Mutlu Yıllar!"}
            </p>
          </div>
          <p className="text-sm text-pink-400/80">
            {isEN
              ? `Today is ${pet.name}'s ${status.age}${status.age === 1 ? "st" : status.age === 2 ? "nd" : status.age === 3 ? "rd" : "th"} birthday! 🎉`
              : `Bugün ${pet.name}'ın ${status.age}. doğum günü! 🎉`}
          </p>
        </motion.div>
      ))}

      {upcomingBirthdays.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎂</span>
            <p className="font-bold text-pink-400">
              {isEN ? "Upcoming Birthdays" : "Yaklaşan Doğum Günleri"}
            </p>
          </div>
          <ul className="flex flex-col gap-1">
            {upcomingBirthdays.map(({ pet, status }) => (
              <li key={pet.id} className="text-sm text-pink-400/80">
                • <span className="font-medium">{pet.name}</span> —{" "}
                {isEN
                  ? `${status.daysUntil} day${status.daysUntil !== 1 ? "s" : ""} left (turning ${status.age})`
                  : `${status.daysUntil} gün kaldı (${status.age} yaşına giriyor)`}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {overdueRecords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⚠️</span>
            <p className="font-bold text-red-400">
              {overdueRecords.length} {isEN ? "Overdue" : "Gecikmiş"}
            </p>
          </div>
          <ul className="flex flex-col gap-1">
            {overdueRecords.map((r) => (
              <li key={r.id} className="text-sm text-red-400/80">
                • <span className="font-medium">{getPetName(r.petId)}</span> — {r.type} ({Math.abs(getDaysUntil(r.nextDate))} {isEN ? "days ago" : "gün geçti"})
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {upcomingRecords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⏰</span>
            <p className="font-bold text-yellow-400">
              {upcomingRecords.length} {isEN ? "Upcoming" : "Yaklaşan"}
            </p>
          </div>
          <ul className="flex flex-col gap-1">
            {upcomingRecords.map((r) => (
              <li key={r.id} className="text-sm text-yellow-400/80">
                • <span className="font-medium">{getPetName(r.petId)}</span> — {r.type} ({getDaysUntil(r.nextDate)} {isEN ? "days left" : "gün kaldı"})
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}

export default SummaryBanner;