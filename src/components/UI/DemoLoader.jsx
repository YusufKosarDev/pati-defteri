import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useLoadDemoData } from "../../hooks/useDemoData";

function DemoLoader({ onClose }) {
  const loadDemoData = useLoadDemoData();
  const { i18n } = useTranslation();
  const isEN = i18n.language === "en";

  const handleLoadDemo = async () => {
    onClose();
    try {
      await loadDemoData();
      toast.success(isEN ? "Demo data loaded! 🐾" : "Demo veriler yüklendi! 🐾");
    } catch (err) {
      console.error(err);
      toast.error(isEN ? "Could not load demo data." : "Demo veriler yüklenemedi.");
    }
  };

  const items = isEN ? [
    { emoji: "🐱", text: "Snowball — Turkish Van Cat, 3 years old" },
    { emoji: "🐶", text: "Caramel — Golden Retriever, 4 years old" },
    { emoji: "💉", text: "8 vaccine & care records" },
    { emoji: "⚖️", text: "Weight history with charts" },
    { emoji: "🏥", text: "Vet information" },
  ] : [
    { emoji: "🐱", text: "Pamuk — Van Kedisi, 3 yaşında" },
    { emoji: "🐶", text: "Karamel — Golden Retriever, 4 yaşında" },
    { emoji: "💉", text: "8 aşı & bakım kaydı" },
    { emoji: "⚖️", text: "Grafik ile ağırlık geçmişi" },
    { emoji: "🏥", text: "Veteriner bilgileri" },
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
          {isEN ? "Welcome to PatiDefteri!" : "PatiDefteri'ne Hoş Geldin!"}
        </h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          {isEN
            ? "Would you like to explore the app with sample pets and records?"
            : "Uygulamayı örnek hayvanlar ve kayıtlarla keşfetmek ister misin?"}
        </p>

        <div className="bg-gray-800 rounded-2xl p-4 mb-6 text-left">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">
            {isEN ? "Demo includes" : "Demo içeriği"}
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
            ✨ {isEN ? "Load Demo Data" : "Demo Verileri Yükle"}
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 py-3 rounded-2xl font-medium transition-colors cursor-pointer text-sm"
          >
            {isEN ? "Start Empty" : "Boş Başla"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default DemoLoader;
