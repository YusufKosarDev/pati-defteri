import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

function ConfirmModal({ isOpen, onClose, onConfirm, title, desc, confirmText, confirmVariant = "danger" }) {
  const { t } = useTranslation();

  const variants = {
    danger: "bg-red-500 hover:bg-red-600 text-white",
    primary: "bg-emerald-500 hover:bg-emerald-600 text-white",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 z-10"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-950 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                🗑️
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{title}</h2>
              {desc && <p className="text-sm text-gray-400 dark:text-gray-500">{desc}</p>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-sm"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => { onConfirm(); onClose(); }}
                className={`flex-1 py-2.5 rounded-xl font-medium transition-colors cursor-pointer text-sm ${variants[confirmVariant]}`}
              >
                {confirmText || t("delete")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmModal;