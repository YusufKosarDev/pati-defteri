import { useState } from "react";
import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePet } from "../../context/PetContext";
import { formatDate, getDaysUntil, isOverdue, isUpcoming } from "../../utils/dateHelpers";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import RecordForm from "./RecordForm";

function RecordCard({ record, index = 0 }) {
  const { deleteRecord } = usePet();
  const [editOpen, setEditOpen] = useState(false);

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

  const getBadge = () => {
    if (!record.nextDate) return null;
    if (overdue) return <span className="text-xs bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-2 py-1 rounded-full font-medium">⚠️ {Math.abs(daysUntil)} gün geçti</span>;
    if (upcoming) return <span className="text-xs bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full font-medium">⏰ {daysUntil} gün kaldı</span>;
    return <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full font-medium">✅ {daysUntil} gün kaldı</span>;
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
        className={`bg-white dark:bg-gray-900 rounded-2xl border p-4 flex flex-col gap-2 ${overdue ? "border-red-200 dark:border-red-900" : upcoming ? "border-yellow-200 dark:border-yellow-900" : "border-gray-100 dark:border-gray-800"} ${isDragging ? "shadow-xl" : ""}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              {...attributes}
              {...listeners}
              className="text-gray-300 dark:text-gray-600 hover:text-gray-500 cursor-grab active:cursor-grabbing text-lg select-none"
              title="Sürükleyerek sırala"
            >
              ⠿
            </span>
            <h4 className="font-bold text-gray-800 dark:text-gray-100">{record.type}</h4>
          </div>
          {getBadge()}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">📅 Yapıldı: {formatDate(record.date)}</p>
        {record.nextDate && <p className="text-sm text-gray-500 dark:text-gray-400">🔔 Sonraki: {formatDate(record.nextDate)}</p>}
        {record.notes && <p className="text-sm text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">{record.notes}</p>}

        <div className="flex gap-2 mt-1">
          <Button variant="outline" onClick={() => setEditOpen(true)} className="flex-1">Düzenle</Button>
          <Button variant="danger" onClick={() => deleteRecord(record.id)}>Sil</Button>
        </div>
      </motion.div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Kaydı Düzenle">
        <RecordForm petId={record.petId} onClose={() => setEditOpen(false)} existingRecord={record} />
      </Modal>
    </>
  );
}

export default RecordCard;