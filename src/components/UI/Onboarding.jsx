import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import useLocalStorage from "../../hooks/useLocalStorage";

function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0);
  const { t } = useTranslation();

  const steps = [
    {
      emoji: "🐾",
      title: t("onboarding1Title"),
      desc: t("onboarding1Desc"),
      color: "from-emerald-400 to-teal-500",
    },
    {
      emoji: "💉",
      title: t("onboarding2Title"),
      desc: t("onboarding2Desc"),
      color: "from-blue-400 to-indigo-500",
    },
    {
      emoji: "⚖️",
      title: t("onboarding3Title"),
      desc: t("onboarding3Desc"),
      color: "from-violet-400 to-purple-500",
    },
    {
      emoji: "📄",
      title: t("onboarding4Title"),
      desc: t("onboarding4Desc"),
      color: "from-orange-400 to-rose-500",
    },
    {
      emoji: "🚀",
      title: t("onboarding5Title"),
      desc: t("onboarding5Desc"),
      color: "from-emerald-400 to-cyan-500",
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 w-full max-w-md overflow-hidden"
      >
        {/* Progress bar */}
        <div className="h-1 bg-gray-800">
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="text-center"
            >
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${current.color} flex items-center justify-center text-5xl mx-auto mb-6 shadow-lg`}>
                {current.emoji}
              </div>
              <h2 className="text-2xl font-bold text-gray-100 mb-3">
                {current.title}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                {current.desc}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-8 mb-6">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`rounded-full transition-all cursor-pointer ${
                  i === step
                    ? "w-6 h-2 bg-emerald-500"
                    : "w-2 h-2 bg-gray-700"
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3 rounded-2xl border border-gray-700 text-gray-400 font-medium hover:bg-gray-800 transition-colors cursor-pointer text-sm"
              >
                {t("onboardingBack")}
              </button>
            )}
            <button
              onClick={() => isLast ? onFinish() : setStep(step + 1)}
              className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors cursor-pointer text-sm"
            >
              {isLast ? t("onboardingStart") : t("onboardingNext")}
            </button>
          </div>

          {step === 0 && (
            <button
              onClick={onFinish}
              className="w-full text-center text-xs text-gray-600 mt-4 cursor-pointer hover:text-gray-400 transition-colors"
            >
              {t("onboardingSkip")}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function OnboardingWrapper({ children }) {
  const [seen, setSeen] = useLocalStorage("onboarding_seen", false);
  const { user } = useAuth();

  if (!seen) {
    return (
      <>
        {children}
        <Onboarding onFinish={() => setSeen(true)} />
      </>
    );
  }

  return children;
}

export default OnboardingWrapper;