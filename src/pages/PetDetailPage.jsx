import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { formatDate, calculateAge, getAvatarGradient } from "../utils/dateHelpers";
import RecordList from "../components/Record/RecordList";
import WeightSection from "../components/Weight/WeightSection";
import VetCard from "../components/Vet/VetCard";
import Button from "../components/UI/Button";
import ExportButton from "../components/UI/ExportButton";
import QRModal from "../components/UI/QRModal";
import { RecordCardSkeleton, SkeletonBox } from "../components/UI/Skeleton";
import usePageTitle from "../hooks/usePageTitle";

const tabs = [
  { key: "records", icon: "💉", labelKey: "recordsTitle" },
  { key: "weight", icon: "⚖️", labelKey: "weightTitle" },
  { key: "vet", icon: "🏥", labelKey: "vetTitle" },
];

function PetDetailPage({ pet, onBack, initialTab = "records", onTabChange }) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [qrOpen, setQrOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === "en";

  usePageTitle(pet?.name);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [pet.id, initialTab]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [pet.id]);

  const age = calculateAge(pet.birthDate);
  const gradient = getAvatarGradient(pet.name);
  const emoji = pet.type === "Kedi" || pet.type === "Cat" ? "🐱" : pet.type === "Köpek" || pet.type === "Dog" ? "🐶" : "🐾";

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <SkeletonBox className="h-10 w-20" />
          <SkeletonBox className="h-10 w-28" />
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6 flex items-center gap-5">
          <SkeletonBox className="w-20 h-20 rounded-2xl" />
          <div className="flex flex-col gap-2 flex-1">
            <SkeletonBox className="h-7 w-40" />
            <SkeletonBox className="h-4 w-32" />
            <SkeletonBox className="h-4 w-24" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <RecordCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Üst Bar */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="secondary" onClick={onBack}>{t("back")}</Button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQrOpen(true)}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors border border-gray-700"
          >
            📱 QR
          </button>
          <ExportButton pet={pet} />
        </div>
      </div>

      {/* Profil Kartı */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-3xl border border-gray-800 p-6 mb-6 shadow-sm overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="flex items-center gap-5 relative">
          {pet.photo ? (
            <img src={pet.photo} alt={pet.name} className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-700 shadow-md" />
          ) : (
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg bg-gradient-to-br ${gradient}`}>
              {pet.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-gray-100">{pet.name}</h2>
              <span className="text-2xl">{emoji}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-lg">
                {pet.type}{pet.breed ? ` · ${pet.breed}` : ""}
              </span>
              {age && (
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg font-medium">{age}</span>
              )}
              {pet.birthDate && (
                <span className="text-xs bg-pink-500/10 text-pink-400 px-2 py-1 rounded-lg">🎂 {formatDate(pet.birthDate)}</span>
              )}
            </div>
            {pet.notes && (
              <p className="text-sm text-gray-500 mt-2 bg-gray-800 rounded-xl px-3 py-2">{pet.notes}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tab Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900 rounded-2xl border border-gray-800 p-1.5 flex gap-1 mb-6 shadow-sm"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); onTabChange?.(tab.key); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === tab.key
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:block">{t(tab.labelKey)}</span>
          </button>
        ))}
      </motion.div>

      {/* Tab İçeriği */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "records" && <RecordList petId={pet.id} />}
          {activeTab === "weight" && <WeightSection petId={pet.id} />}
          {activeTab === "vet" && <VetCard pet={pet} />}
        </motion.div>
      </AnimatePresence>

      {/* QR Modal */}
      <QRModal isOpen={qrOpen} onClose={() => setQrOpen(false)} pet={pet} />
    </div>
  );
}

export default PetDetailPage;