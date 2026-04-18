import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePet } from "../context/PetContext";
import { useAuth } from "../context/AuthContext";
import PetList from "../components/Pet/PetList";
import SummaryBanner from "../components/UI/SummaryBanner";
import DemoLoader from "../components/UI/DemoLoader";
import { PageSkeleton } from "../components/UI/Skeleton";
import { isOverdue, isUpcoming } from "../utils/dateHelpers";
import useLocalStorage from "../hooks/useLocalStorage";

function StatCard({ icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-gray-900 rounded-2xl border border-gray-800 p-4 flex items-center gap-4 shadow-sm"
    >
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-100">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </motion.div>
  );
}

function HomePage({ onSelectPet }) {
  const [loading, setLoading] = useState(true);
  const { pets, records } = usePet();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === "en";

  const [demoShown, setDemoShown] = useLocalStorage(`demo_shown_${user?.id}`, false);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      if (!demoShown && pets.length === 0) {
        setShowDemo(true);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleDemoClose = () => {
    setShowDemo(false);
    setDemoShown(true);
  };

  if (loading) return <PageSkeleton />;

  const overdueCount = records.filter((r) => r.nextDate && isOverdue(r.nextDate)).length;
  const upcomingCount = records.filter((r) => r.nextDate && isUpcoming(r.nextDate)).length;

  const stats = [
    { icon: "🐾", label: t("myPetsTitle"), value: pets.length, color: "bg-emerald-500/10", delay: 0.1 },
    { icon: "💉", label: t("recordsTitle"), value: records.length, color: "bg-blue-500/10", delay: 0.15 },
    { icon: "⏰", label: t("upcomingTitle"), value: upcomingCount, color: "bg-yellow-500/10", delay: 0.2 },
    { icon: "⚠️", label: t("overdueTitle"), value: overdueCount, color: "bg-red-500/10", delay: 0.25 },
  ];

  const hour = new Date().getHours();
  const greeting = isEN
    ? hour < 12 ? "🌅 Good morning!" : hour < 18 ? "☀️ Good afternoon!" : "🌙 Good evening!"
    : hour < 12 ? "🌅 Günaydın!" : hour < 18 ? "☀️ İyi günler!" : "🌙 İyi akşamlar!";

  return (
    <>
      <AnimatePresence>
        {showDemo && <DemoLoader onClose={handleDemoClose} />}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold text-gray-100">{greeting}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pets.length === 0
              ? (isEN ? "Add your first pet to get started." : "Başlamak için ilk hayvanını ekle.")
              : isEN
                ? `You're tracking ${pets.length} pet${pets.length > 1 ? "s" : ""}.`
                : `${pets.length} hayvanı takip ediyorsunuz.`}
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
    </>
  );
}

export default HomePage;