import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useLoadDemoData } from "../../hooks/useDemoData";
import { captureException } from "../../lib/sentry";

function DemoLoader({ onClose }: { onClose: () => void }) {
  const loadDemoData = useLoadDemoData();
  const { t } = useTranslation();

  const handleLoadDemo = async () => {
    onClose();
    try {
      await loadDemoData();
      toast.success(t("demoLoaded"));
    } catch (err) {
      captureException(err);
      toast.error(t("demoLoadFailed"));
    }
  };

  const items = [
    { emoji: "🐱", text: t("demoItemSnowball") },
    { emoji: "🐶", text: t("demoItemCaramel") },
    { emoji: "💉", text: t("demoItemRecords") },
    { emoji: "⚖️", text: t("demoItemWeights") },
    { emoji: "🏥", text: t("demoItemVets") },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl w-full max-w-sm p-8 text-center"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="text-6xl mb-4"
        >
          🐾
        </motion.div>

        <h2 className="text-xl font-bold text-gray-100 mb-2">
          {t("demoWelcome")}
        </h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          {t("demoQuestion")}
        </p>

        <div className="bg-gray-800 rounded-2xl p-4 mb-6 text-left">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">
            {t("demoIncludes")}
          </p>
          <div className="flex flex-col gap-2">
            {items.map((item, i) => (
              <motion.div
                key={item.emoji + item.text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="flex items-center gap-2 text-sm text-gray-300"
              >
                <span>{item.emoji}</span>
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleLoadDemo}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl font-medium transition-all hover:scale-105 cursor-pointer text-sm"
          >
            {t("demoLoad")}
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 py-3 rounded-2xl font-medium transition-colors cursor-pointer text-sm"
          >
            {t("demoSkip")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default DemoLoader;
