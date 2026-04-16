import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePet } from "../context/PetContext";
import PetList from "../components/Pet/PetList";
import SummaryBanner from "../components/UI/SummaryBanner";
import { PageSkeleton } from "../components/UI/Skeleton";
import { isOverdue, isUpcoming } from "../utils/dateHelpers";

function StatCard({ icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4 shadow-sm`}
    >
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
      </div>
    </motion.div>
  );
}

function HomePage({ onSelectPet }) {
  const [loading, setLoading] = useState(true);
  const { pets, records } = usePet();
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <PageSkeleton />;

  const overdueCount = records.filter((r) => r.nextDate && isOverdue(r.nextDate)).length;
  const upcomingCount = records.filter((r) => r.nextDate && isUpcoming(r.nextDate)).length;

  const stats = [
    { icon: "🐾", label: t("myPetsTitle"), value: pets.length, color: "bg-emerald-50 dark:bg-emerald-950", delay: 0.1 },
    { icon: "💉", label: t("recordsTitle"), value: records.length, color: "bg-blue-50 dark:bg-blue-950", delay: 0.15 },
    { icon: "⏰", label: t("upcomingTitle"), value: upcomingCount, color: "bg-yellow-50 dark:bg-yellow-950", delay: 0.2 },
    { icon: "⚠️", label: t("overdueTitle"), value: overdueCount, color: "bg-red-50 dark:bg-red-950", delay: 0.25 },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "🌅 Günaydın!" : hour < 18 ? "☀️ İyi günler!" : "🌙 İyi akşamlar!";

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{greeting}</h1>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
          {pets.length === 0
            ? t("noPetsDesc")
            : `${pets.length} ${t("myPetsTitle").toLowerCase()} takip ediyorsunuz.`}
        </p>
      </motion.div>

      {pets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      <SummaryBanner />
      <PetList onSelectPet={onSelectPet} />
    </div>
  );
}

export default HomePage;