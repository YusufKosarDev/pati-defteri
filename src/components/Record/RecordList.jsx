import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { usePet } from "../../context/PetContext";
import RecordCard from "./RecordCard";
import Modal from "../UI/Modal";
import RecordForm from "./RecordForm";
import Button from "../UI/Button";
import EmptyState from "../UI/EmptyState";

const RECORD_TYPES_TR = ["Tümü", "Karma Aşı", "Kuduz Aşısı", "Parazit Damlası", "Pire İlacı", "Kurtluk İlacı", "Veteriner Ziyareti", "Diğer"];
const RECORD_TYPES_EN = ["All", "Mixed Vaccine", "Rabies Vaccine", "Parasite Drop", "Flea Medicine", "Dewormer", "Vet Visit", "Other"];

function RecordList({ petId }) {
  const { getRecordsByPet, records, setRecords } = usePet();
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === "en";
  const [addOpen, setAddOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const sensors = useSensors(useSensor(PointerSensor));

  const RECORD_TYPES = isEN ? RECORD_TYPES_EN : RECORD_TYPES_TR;
  const ALL_LABEL = isEN ? "All" : "Tümü";

  const allRecords = getRecordsByPet(petId);
  const filtered = activeFilter === "all"
    ? allRecords
    : allRecords.filter((r) => r.type === activeFilter);
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((r) => r.id === active.id);
    const newIndex = sorted.findIndex((r) => r.id === over.id);
    const reordered = arrayMove(sorted, oldIndex, newIndex);
    const otherRecords = records.filter((r) => r.petId !== petId);
    setRecords([...otherRecords, ...reordered]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-200">{t("recordsTitle")}</h3>
        <Button onClick={() => setAddOpen(true)}>{t("addRecord")}</Button>
      </div>

      {allRecords.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {RECORD_TYPES.map((type, idx) => {
            const filterVal = idx === 0 ? "all" : type;
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(filterVal)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeFilter === filterVal
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      )}

      {sorted.length === 0 && allRecords.length === 0 ? (
        <EmptyState type="records" title={t("noRecords")} desc={t("noRecordsDesc")} />
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <div className="text-5xl mb-3">🔍</div>
          <p className="font-medium">{t("noFilterResult")}</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sorted.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3">
              {sorted.map((record, index) => (
                <RecordCard key={record.id} record={record} index={index} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title={t("addRecordTitle")}>
        <RecordForm petId={petId} onClose={() => setAddOpen(false)} />
      </Modal>
    </div>
  );
}

export default RecordList;