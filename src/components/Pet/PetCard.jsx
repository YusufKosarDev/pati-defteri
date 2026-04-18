import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePet } from "../../context/PetContext";
import { formatDate, calculateAge, getAvatarGradient, isOverdue, isUpcoming } from "../../utils/dateHelpers";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import ConfirmModal from "../UI/ConfirmModal";
import PetForm from "./PetForm";

function PetCard({ pet, onSelect, index = 0 }) {
  const { deletePet, getRecordsByPet } = usePet();
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === "en";
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const age = calculateAge(pet.birthDate);
  const gradient = getAvatarGradient(pet.name);
  const emoji = pet.type === "Kedi" || pet.type === "Cat" ? "🐱" : pet.type === "Köpek" || pet.type === "Dog" ? "🐶" : "🐾";

  const records = getRecordsByPet(pet.id);
  const overdueCount = records.filter((r) => r.nextDate && isOverdue(r.nextDate)).length;
  const upcomingCount = records.filter((r) => r.nextDate && isUpcoming(r.nextDate)).length;
  const badgeCount = overdueCount + upcomingCount;
  const badgeColor = overdueCount > 0 ? "bg-red-500" : "bg-yellow-500";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, delay: index * 0.08 }}
        whileHover={{ y: -2 }}
        className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 p-4 flex flex-col gap-3 hover:border-gray-700 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            {pet.photo ? (
              <img src={pet.photo} alt={pet.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-700" />
            ) : (
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg bg-gradient-to-br ${gradient}`}>
                {pet.name?.charAt(0).toUpperCase()}
              </div>
            )}
            {badgeCount > 0 && (
              <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 ${badgeColor} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                {badgeCount}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-100 truncate">{pet.name}</h3>
              <span className="flex-shrink-0">{emoji}</span>
            </div>
            <p className="text-sm text-gray-500 truncate">{pet.type}{pet.breed ? ` · ${pet.breed}` : ""}</p>
            {age && <p className="text-xs text-emerald-400 font-medium">{age}</p>}
            {pet.birthDate && <p className="text-xs text-gray-600">{formatDate(pet.birthDate)}</p>}
          </div>
        </div>

        {badgeCount > 0 && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium ${
            overdueCount > 0
              ? "bg-red-500/10 text-red-400 border border-red-500/20"
              : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
          }`}>
            <span>{overdueCount > 0 ? "⚠️" : "⏰"}</span>
            <span>
              {overdueCount > 0
                ? `${overdueCount} ${isEN ? "overdue" : "gecikmiş"}`
                : `${upcomingCount} ${isEN ? "upcoming" : "yaklaşan"}`
              } {isEN ? "care" : "bakım"}
            </span>
          </div>
        )}

        {pet.notes && (
          <p className="text-sm text-gray-500 bg-gray-800 rounded-xl px-3 py-2 truncate">{pet.notes}</p>
        )}

        <div className="flex gap-2">
          <Button onClick={() => onSelect(pet)} className="flex-1">{t("records")}</Button>
          <Button variant="outline" onClick={() => setEditOpen(true)}>{t("edit")}</Button>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>{t("delete")}</Button>
        </div>
      </motion.div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title={t("editPetTitle")}>
        <PetForm onClose={() => setEditOpen(false)} existingPet={pet} />
      </Modal>

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deletePet(pet.id)}
        title={isEN ? `Delete ${pet.name}?` : `${pet.name} silinsin mi?`}
        desc={isEN
          ? "All records and weight data will also be deleted. This cannot be undone!"
          : "Tüm kayıtlar ve ağırlık verileri de silinecek. Bu işlem geri alınamaz!"}
        confirmText={t("delete")}
      />
    </>
  );
}

export default PetCard;