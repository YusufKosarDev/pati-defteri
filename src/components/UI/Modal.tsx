import { motion, AnimatePresence } from "framer-motion";
import { useId, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import useModalA11y from "../../hooks/useModalA11y";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
};

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useModalA11y(isOpen, onClose);
  const titleId = useId();
  const { t } = useTranslation();

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
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative bg-gray-900 border border-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 z-10 focus:outline-none"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id={titleId} className="text-xl font-bold text-gray-100">{title}</h2>
              <button
                onClick={onClose}
                aria-label={t("modalClose")}
                className="text-gray-400 hover:text-gray-200 text-2xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
