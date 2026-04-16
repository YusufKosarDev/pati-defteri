import { useState } from "react";
import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslation } from "react-i18next";
import { usePet } from "../../context/PetContext";
import { formatDate, getDaysUntil, isOverdue, isUpcoming } from "../../utils/dateHelpers";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import ConfirmModal from "../UI/ConfirmModal";
import RecordForm from "./RecordForm";

const RECORD_ICONS = {
  "Karma Aşı": { icon: "💉", color: "bg-blue-50 dark:bg-blue-950" },
  "Kuduz Aşısı": { icon: "🛡️", color: "bg-red-50 dark:bg-red-950" },
  "Parazit Damlası": { icon: "💧", color: "bg-cyan-50 dark:bg-cyan-950" },
  "Pire İlacı": { icon: "🪲", color: "bg-orange-50 dark:bg-orange-950" },
  "Kurtluk İlacı": { icon: "🪱", color: "bg-yellow-50 dark:bg-yellow-950" },
  "Veteriner Ziyareti": { icon: "🏥", color: "bg-emerald-50 dark:bg-emerald-950" },
  "Diğer": { icon: "📋", color: "bg-gray-50 dark:bg-gray-800" },
};

function RecordCard({ record, index = 0 }) {
  const { deleteRecord } = usePet();
  const { t } = useTranslation();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: record.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const daysUntil = record.nextDate ? getDaysUntil(record.nextDate) : null;
  const overdue = record.nextDate ? isOverdue(record.nextDate) : false;
  const upcoming = record.nextDate ? isUpcoming(record.nextDate) : false;

  const recordStyle = RECORD_ICONS[record.type] || RECORD_ICONS["Diğer"];

  const getBadge = () => {
    if (!record.nextDate) return null;
    if (overdue) return (
      <span className="text-xs bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-2 py-1 rounded-full font-medium">
        ⚠️ {Math.abs(daysUntil)} {t("daysPast")}
      </span>
    );
    if (upcoming) return (
      <span className="text-xs bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full font-medium">
        ⏰ {daysUntil} {t("daysLeft")}
      </span>
    );
    return (
      <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full font-medium">
        ✅ {daysUntil} {t("daysLeft")}
      </span>
    );
  };

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        className={`bg-white dark:bg-gray-900 rounded-2xl border p-4 flex flex-col gap-2 ${
          overdue ? "border-red-200 dark:border-red-900" :
          upcoming ? "border-yellow-200 dark:border-yellow-900" :
          "border-gray-100 dark:border-gray-800"
        } ${isDragging ? "shadow-xl" : ""}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              {...attributes}
              {...listeners}
              className="text-gray-300 dark:text-gray-600 hover:text-gray-500 cursor-grab active:cursor-grabbing text-lg select-none"
            >
              ⠿
            </span>
            <div className={`w-9 h-9 ${recordStyle.color} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>
              {recordStyle.icon}
            </div>
            <h4 className="font-bold text-gray-800 dark:text-gray-100">{record.type}</h4>
          </div>
          {getBadge()}
        </div>

        <div className="ml-12 flex flex-col gap-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">📅 {t("done")} {formatDate(record.date)}</p>
          {record.nextDate && (
            <p className="text-sm text-gray-500 dark:text-gray-400">🔔 {t("next")} {formatDate(record.nextDate)}</p>
          )}
          {record.notes && (
            <p className="text-sm text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 mt-1">
              {record.notes}
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-1">
          <Button variant="outline" onClick={() => setEditOpen(true)} className="flex-1">{t("edit")}</Button>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>{t("delete")}</Button>
        </div>
      </motion.div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title={t("editRecordTitle")}>
        <RecordForm petId={record.petId} onClose={() => setEditOpen(false)} existingRecord={record} />
      </Modal>

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteRecord(record.id)}
        title={`${record.type} silinsin mi?`}
        desc="Bu kayıt kalıcı olarak silinecek!"
        confirmText={t("delete")}
      />
    </>
  );
}

export default RecordCard;