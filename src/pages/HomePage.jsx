import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePet } from "../context/PetContext";
import { useAuth } from "../context/AuthContext";
import PetList from "../components/Pet/PetList";
import SummaryBanner from "../components/UI/SummaryBanner";
import DemoLoader from "../components/UI/DemoLoader";
import { PageSkeleton } from "../components/UI/Skeleton";
import { isOverdue, isUpcoming, getDaysUntil } from "../utils/dateHelpers";
import useLocalStorage from "../hooks/useLocalStorage";
import usePageTitle from "../hooks/usePageTitle";

function StatCard({ icon, label, value, color, delay, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-gray-900 rounded-2xl border border-gray-800 p-4 flex items-center gap-4 shadow-sm hover:border-gray-700 transition-all"
    >
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-100">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
        {sub && <p className="text-xs text-emerald-400 font-medium mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

function QuickInsight({ icon, text, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${color}`}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </motion.div>
  );
}

function HomePage({ onSelectPet }) {
  const [loading, setLoading] = useState(true);
  const [showDemo, setShowDemo] = useState(false);
  const { pets, records, weights } = usePet();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === "en";

  usePageTitle(isEN ? "My Pets" : "Hayvanlarım");

  const [onboardingSeen] = useLocalStorage("onboarding_seen", false);
  const [demoShown, setDemoShown] = useLocalStorage(`demo_shown_${user?.id}`, false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      if (onboardingSeen && !demoShown && pets.length === 0) {
        setShowDemo(true);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [onboardingSeen]);

  const handleDemoClose = () => {
    setShowDemo(false);
    setDemoShown(true);
  };

  if (loading) return <PageSkeleton />;

  const overdueRecords = records.filter((r) => r.nextDate && isOverdue(r.nextDate));
  const upcomingRecords = records.filter((r) => r.nextDate && isUpcoming(r.nextDate));
  const overdueCount = overdueRecords.length;
  const upcomingCount = upcomingRecords.length;

  const nextCare = records
    .filter((r) => r.nextDate && !isOverdue(r.nextDate))
    .sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate))[0];
  const nextCarePet = nextCare ? pets.find((p) => p.id === nextCare.petId) : null;
  const nextCareDays = nextCare ? getDaysUntil(nextCare.nextDate) : null;

  const lastRecord = [...records].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const lastRecordPet = lastRecord ? pets.find((p) => p.id === lastRecord.petId) : null;

  const totalWeights = weights.length;

  const insights = [];
  if (overdueCount > 0) {
    insights.push({
      icon: "⚠️",
      text: isEN ? `${overdueCount} overdue care needs attention!` : `${overdueCount} gecikmiş bakım acil ilgi gerektiriyor!`,
      color: "bg-red-500/10 text-red-400 border border-red-500/20",
    });
  }
  if (nextCare && nextCarePet) {
    insights.push({
      icon: "⏰",
      text: isEN
        ? `${nextCarePet.name}'s ${nextCare.type} in ${nextCareDays === 0 ? "today" : `${nextCareDays} days`}`
        : `${nextCarePet.name}'ın ${nextCare.type} bakımı ${nextCareDays === 0 ? "bugün" : `${nextCareDays} gün sonra`}`,
      color: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    });
  }
  if (lastRecordPet && !overdueCount) {
    insights.push({
      icon: "✅",
      text: isEN
        ? `Last record: ${lastRecordPet.name}'s ${lastRecord.type}`
        : `Son kayıt: ${lastRecordPet.name}'ın ${lastRecord.type}`,
      color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    });
  }

  const stats = [
    {
      icon: "🐾",
      label: isEN ? "Pets" : "Hayvan",
      value: pets.length,
      color: "bg-emerald-500/10",
      delay: 0.1,
      sub: pets.length > 0
        ? isEN
          ? `${pets.filter(p => p.type === "Kedi" || p.type === "Cat").length} cat, ${pets.filter(p => p.type === "Köpek" || p.type === "Dog").length} dog`
          : `${pets.filter(p => p.type === "Kedi" || p.type === "Cat").length} kedi, ${pets.filter(p => p.type === "Köpek" || p.type === "Dog").length} köpek`
        : null,
    },
    {
      icon: "💉",
      label: isEN ? "Records" : "Kayıt",
      value: records.length,
      color: "bg-blue-500/10",
      delay: 0.15,
      sub: records.length > 0
        ? isEN
          ? `avg ${(records.length / Math.max(pets.length, 1)).toFixed(1)} per pet`
          : `pet başına ort. ${(records.length / Math.max(pets.length, 1)).toFixed(1)}`
        : null,
    },
    {
      icon: "⏰",
      label: isEN ? "Upcoming" : "Yaklaşan",
      value: upcomingCount,
      color: "bg-yellow-500/10",
      delay: 0.2,
      sub: upcomingCount > 0
        ? (isEN ? "within 30 days" : "30 gün içinde")
        : (isEN ? "all clear!" : "hepsi tamam!"),
    },
    {
      icon: "⚠️",
      label: isEN ? "Overdue" : "Gecikmiş",
      value: overdueCount,
      color: overdueCount > 0 ? "bg-red-500/10" : "bg-gray-800",
      delay: 0.25,
      sub: overdueCount > 0
        ? (isEN ? "needs attention" : "ilgi gerektiriyor")
        : (isEN ? "nothing overdue" : "gecikmiş yok"),
    },
    {
      icon: "⚖️",
      label: isEN ? "Weight Records" : "Ağırlık Kaydı",
      value: totalWeights,
      color: "bg-violet-500/10",
      delay: 0.3,
      sub: totalWeights > 0
        ? (isEN ? `for ${pets.length} pet${pets.length > 1 ? "s" : ""}` : `${pets.length} hayvan için`)
        : null,
    },
    {
      icon: "📅",
      label: isEN ? "This Month" : "Bu Ay",
      value: records.filter((r) => {
        const d = new Date(r.date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,
      color: "bg-pink-500/10",
      delay: 0.35,
      sub: isEN ? "care records done" : "bakım kaydı yapıldı",
    },
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
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {stats.map((s) => (
                <StatCard key={s.label} {...s} />
              ))}
            </div>

            {insights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-2 mb-6"
              >
                {insights.map((insight, i) => (
                  <QuickInsight key={i} {...insight} />
                ))}
              </motion.div>
            )}
          </>
        )}

        <SummaryBanner />
        <PetList onSelectPet={onSelectPet} />
      </div>
    </>
  );
}

export default HomePage;