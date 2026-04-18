import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import usePageTitle from "../hooks/usePageTitle";

function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  usePageTitle("404");

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="text-8xl mb-6"
        >
          🐾
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-8xl font-black text-emerald-500 mb-2"
        >
          404
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-100 mb-3"
        >
          Kaybolmuş gibi görünüyor! 🔍
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 mb-8 leading-relaxed"
        >
          Aradığınız sayfa bulunamadı. Belki bir kedi kaçırdı onu. 🐱
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={() => navigate("/")}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-medium transition-all hover:scale-105 cursor-pointer"
          >
            🏠 Ana Sayfaya Dön
          </button>
          <button
            onClick={() => navigate("/app")}
            className="bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800 px-6 py-3 rounded-2xl font-medium transition-colors cursor-pointer"
          >
            🐾 Hayvanlara Git
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 flex justify-center gap-4 text-3xl"
        >
          {["🐾", "🐾", "🐾"].map((p, i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
            >
              {p}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default NotFoundPage;