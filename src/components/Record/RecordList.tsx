import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { usePet } from "../../hooks/usePet";
import { RECORD_TYPE_KEYS, recordTypeLabel } from "../../utils/recordTypes";
import { sortRecordsForDisplay } from "../../utils/sortRecords";
import RecordCard from "./RecordCard";
import Modal from "../UI/Modal";
import RecordForm from "./RecordForm";
import Button from "../UI/Button";
import EmptyState from "../UI/EmptyState";
import type { Id } from "../../../convex/_generated/dataModel";

function RecordList({ petId }: { petId: Id<"pets"> }) {
  const { getRecordsByPet, reorderRecords } = usePet();
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === "en";
  const [addOpen, setAddOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const sensors = useSensors(useSensor(PointerSensor));

  // Filtre seçenekleri: "Tümü" + kanonik kayıt türü anahtarları (etiketler dile göre).
  const filterOptions = [
    { key: "all", label: t("filterAll") },
    ...RECORD_TYPE_KEYS.map((k) => ({ key: k, label: recordTypeLabel(k, isEN) })),
  ];

  const allRecords = getRecordsByPet(petId);
  const filtered = activeFilter === "all"
    ? allRecords
    : allRecords.filter((r) => r.type === activeFilter);
  const sorted = sortRecordsForDisplay(filtered);

  // Sürükle-bırak yalnızca filtresiz ("Tümü") görünümde — bir alt küme yeniden
  // sıralanırsa global `order` tutarsız olurdu.
  const dragEnabled = activeFilter === "all";

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!dragEnabled) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((r) => r.id === active.id);
    const newIndex = sorted.findIndex((r) => r.id === over.id);
    const reordered = arrayMove(sorted, oldIndex, newIndex);
    await reorderRecords(reordered.map((r) => r.id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-200">{t("recordsTitle")}</h3>
        <Button onClick={() => setAddOpen(true)}>{t("addRecord")}</Button>
      </div>

      {allRecords.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setActiveFilter(opt.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeFilter === opt.key
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
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
                <RecordCard key={record.id} record={record} index={index} sortable={dragEnabled} />
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
