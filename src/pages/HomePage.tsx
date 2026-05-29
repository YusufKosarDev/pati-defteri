import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { usePet } from "../hooks/usePet";
import { useAuth } from "../hooks/useAuth";
import { useLoadDemoData } from "../hooks/useDemoData";
import PetList from "../components/Pet/PetList";
import SummaryBanner from "../components/UI/SummaryBanner";
import DemoLoader from "../components/UI/DemoLoader";
import { PageSkeleton } from "../components/UI/Skeleton";
import { isOverdue, isUpcoming, getDaysUntil } from "../utils/dateHelpers";
import { recordTypeLabel } from "../utils/recordTypes";
import useLocalStorage from "../hooks/useLocalStorage";
import usePageTitle from "../hooks/usePageTitle";
import { captureException } from "../lib/sentry";
import type { Pet } from "../types";

type StatCardProps = {
  icon: string;
  label: string;
  value: number;
  color: string;
  delay: number;
  sub?: string | null;
};

function StatCard({ icon, label, value, color, delay, sub }: StatCardProps) {
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

function QuickInsight({ icon, text, color }: { icon: string; text: string; color: string }) {
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

function HomePage({ onSelectPet }: { onSelectPet: (pet: Pet) => void }) {
  const { pets, records, weights, loading } = usePet();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === "en";

  usePageTitle(t("myPets"));

  const [onboardingSeen] = useLocalStorage("onboarding_seen", false);
  const [demoShown, setDemoShown] = useLocalStorage(`demo_shown_${user?.id}`, false);
  const loadDemoData = useLoadDemoData();

  // Modal görünürlüğü türetilmiş: kullanıcı modal'ı kapatınca demoShown true
  // olur ve bu otomatik olarak false'a düşer (effect içinde setState yok).
  const showDemo = !loading && !demoShown && pets.length === 0 && !user?.isGuest && onboardingSeen;

  useEffect(() => {
    // Misafir kullanıcı için demoyu sessizce auto-load et (modal olmadan).
    if (loading || demoShown || pets.length > 0 || !user?.isGuest) return;
    (async () => {
      try {
        await loadDemoData();
        toast.success(t("homeDemoLoaded"));
      } catch (err) {
        captureException(err, { context: "HomePage auto demo load" });
      }
      setDemoShown(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, demoShown, pets.length, user?.isGuest]);

  const handleDemoClose = () => setDemoShown(true);

  if (loading) return <PageSkeleton />;

  const overdueRecords = records.filter((r) => r.nextDate && isOverdue(r.nextDate));
  const upcomingRecords = records.filter((r) => r.nextDate && isUpcoming(r.nextDate));
  const overdueCount = overdueRecords.length;
  const upcomingCount = upcomingRecords.length;

  const nextCare = records
    .filter((r) => r.nextDate && !isOverdue(r.nextDate))
    .sort((a, b) => new Date(a.nextDate!).getTime() - new Date(b.nextDate!).getTime())[0];
  const nextCarePet = nextCare ? pets.find((p) => p.id === nextCare.petId) : null;
  const nextCareDays = nextCare ? getDaysUntil(nextCare.nextDate) : null;

  const lastRecord = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const lastRecordPet = lastRecord ? pets.find((p) => p.id === lastRecord.petId) : null;

  const totalWeights = weights.length;

  const insights: { icon: string; text: string; color: string }[] = [];
  if (overdueCount > 0) {
    insights.push({
      icon: "⚠️",
      text: t("insightOverdue", { count: overdueCount }),
      color: "bg-red-500/10 text-red-400 border border-red-500/20",
    });
  }
  if (nextCare && nextCarePet) {
    insights.push({
      icon: "⏰",
      text: nextCareDays === 0
        ? t("insightUpcomingToday", { name: nextCarePet.name, type: recordTypeLabel(nextCare.type, isEN) })
        : t("insightUpcomingDays", { name: nextCarePet.name, type: recordTypeLabel(nextCare.type, isEN), days: nextCareDays }),
      color: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    });
  }
  if (lastRecordPet && !overdueCount) {
    insights.push({
      icon: "✅",
      text: t("insightLastRecord", { name: lastRecordPet.name, type: recordTypeLabel(lastRecord.type, isEN) }),
      color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    });
  }

  const catCount = pets.filter((p) => p.type === "cat").length;
  const dogCount = pets.filter((p) => p.type === "dog").length;

  const stats: StatCardProps[] = [
    {
      icon: "🐾",
      label: t("homePets"),
      value: pets.length,
      color: "bg-emerald-500/10",
      delay: 0.1,
      sub: pets.length > 0 ? t("homeCatDog", { cats: catCount, dogs: dogCount }) : null,
    },
    {
      icon: "💉",
      label: t("records"),
      value: records.length,
      color: "bg-blue-500/10",
      delay: 0.15,
      sub: records.length > 0 ? t("homeAvgPerPet", { count: (records.length / Math.max(pets.length, 1)).toFixed(1) }) : null,
    },
    {
      icon: "⏰",
      label: t("homeUpcoming"),
      value: upcomingCount,
      color: "bg-yellow-500/10",
      delay: 0.2,
      sub: upcomingCount > 0 ? t("homeWithin30") : t("homeAllClear"),
    },
    {
      icon: "⚠️",
      label: t("homeOverdue"),
      value: overdueCount,
      color: overdueCount > 0 ? "bg-red-500/10" : "bg-gray-800",
      delay: 0.25,
      sub: overdueCount > 0 ? t("homeNeedsAttention") : t("homeNothingOverdue"),
    },
    {
      icon: "⚖️",
      label: t("homeWeightRecords"),
      value: totalWeights,
      color: "bg-violet-500/10",
      delay: 0.3,
      sub: totalWeights > 0 ? t("homeFor", { count: pets.length }) : null,
    },
    {
      icon: "📅",
      label: t("homeThisMonth"),
      value: records.filter((r) => {
        const d = new Date(r.date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,
      color: "bg-pink-500/10",
      delay: 0.35,
      sub: t("homeCareRecords"),
    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("homeGoodMorning") : hour < 18 ? t("homeGoodAfternoon") : t("homeGoodEvening");

  return (
    <>
      <AnimatePresence>
        {showDemo && <DemoLoader onClose={handleDemoClose} />}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold text-gray-100">{greeting}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pets.length === 0 ? t("homeAddFirst") : t("homeTrackingOne", { count: pets.length })}
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
                {insights.map((insight) => (
                  <QuickInsight key={insight.text} {...insight} />
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
