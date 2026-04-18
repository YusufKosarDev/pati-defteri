import { motion } from "framer-motion";
import { usePet } from "../../context/PetContext";
import { useTranslation } from "react-i18next";
import { isOverdue, isUpcoming, getDaysUntil } from "../../utils/dateHelpers";

function SummaryBanner() {
  const { pets, records } = usePet();
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === "en";

  if (pets.length === 0) return null;

  const overdueRecords = records.filter((r) => r.nextDate && isOverdue(r.nextDate));
  const upcomingRecords = records.filter((r) => r.nextDate && isUpcoming(r.nextDate));
  const getPetName = (petId) => pets.find((p) => p.id === petId)?.name || "";

  if (overdueRecords.length === 0 && upcomingRecords.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3"
      >
        <span className="text-2xl">✅</span>
        <div>
          <p className="font-semibold text-emerald-400">{t("allGood")}</p>
          <p className="text-sm text-emerald-500/70">{t("allGoodDesc")}</p>
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
          className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⚠️</span>
            <p className="font-bold text-red-400">
              {overdueRecords.length} {t("overdueTitle")}
            </p>
          </div>
          <ul className="flex flex-col gap-1">
            {overdueRecords.map((r) => (
              <li key={r.id} className="text-sm text-red-400/80">
                • <span className="font-medium">{getPetName(r.petId)}</span> — {r.type} ({Math.abs(getDaysUntil(r.nextDate))} {t("daysPast")})
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
              {upcomingRecords.length} {t("upcomingTitle")}
            </p>
          </div>
          <ul className="flex flex-col gap-1">
            {upcomingRecords.map((r) => (
              <li key={r.id} className="text-sm text-yellow-400/80">
                • <span className="font-medium">{getPetName(r.petId)}</span> — {r.type} ({getDaysUntil(r.nextDate)} {t("daysLeft")})
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}

export default SummaryBanner;