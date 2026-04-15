import { motion } from "framer-motion";
import { usePet } from "../../context/PetContext";
import { isOverdue, isUpcoming, getDaysUntil } from "../../utils/dateHelpers";

function SummaryBanner() {
  const { pets, records } = usePet();

  if (pets.length === 0) return null;

  const overdueRecords = records.filter((r) => r.nextDate && isOverdue(r.nextDate));
  const upcomingRecords = records.filter((r) => r.nextDate && isUpcoming(r.nextDate));
  const getPetName = (petId) => pets.find((p) => p.id === petId)?.name || "";

  if (overdueRecords.length === 0 && upcomingRecords.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 rounded-2xl p-4 mb-6 flex items-center gap-3"
      >
        <span className="text-2xl">✅</span>
        <div>
          <p className="font-semibold text-emerald-700 dark:text-emerald-400">Her şey yolunda!</p>
          <p className="text-sm text-emerald-500 dark:text-emerald-600">Yaklaşan veya gecikmiş bakım yok.</p>
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
      {overdueRecords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⚠️</span>
            <p className="font-bold text-red-600 dark:text-red-400">{overdueRecords.length} gecikmiş bakım var!</p>
          </div>
          <ul className="flex flex-col gap-1">
            {overdueRecords.map((r) => (
              <li key={r.id} className="text-sm text-red-500 dark:text-red-400">
                • <span className="font-medium">{getPetName(r.petId)}</span> — {r.type} ({Math.abs(getDaysUntil(r.nextDate))} gün geçti)
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
          className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-100 dark:border-yellow-900 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⏰</span>
            <p className="font-bold text-yellow-700 dark:text-yellow-400">{upcomingRecords.length} yaklaşan bakım var!</p>
          </div>
          <ul className="flex flex-col gap-1">
            {upcomingRecords.map((r) => (
              <li key={r.id} className="text-sm text-yellow-600 dark:text-yellow-500">
                • <span className="font-medium">{getPetName(r.petId)}</span> — {r.type} ({getDaysUntil(r.nextDate)} gün kaldı)
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}

export default SummaryBanner;