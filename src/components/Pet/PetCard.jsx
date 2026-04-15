import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePet } from "../../context/PetContext";
import { formatDate, calculateAge, getAvatarColor } from "../../utils/dateHelpers";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import PetForm from "./PetForm";

function PetCard({ pet, onSelect, index = 0 }) {
  const { deletePet } = usePet();
  const { t } = useTranslation();
  const [editOpen, setEditOpen] = useState(false);

  const age = calculateAge(pet.birthDate);
  const avatarColor = getAvatarColor(pet.name);
  const emoji = pet.type === "Kedi" || pet.type === "Cat" ? "🐱" : pet.type === "Köpek" || pet.type === "Dog" ? "🐶" : "🐾";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, delay: index * 0.08 }}
        whileHover={{ y: -2 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-3">
          {pet.photo ? (
            <img src={pet.photo} alt={pet.name} className="w-16 h-16 rounded-full object-cover border-2 border-emerald-100" />
          ) : (
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow ${avatarColor}`}>
              {pet.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{pet.name}</h3>
              <span>{emoji}</span>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">{pet.type}{pet.breed ? ` · ${pet.breed}` : ""}</p>
            {age && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{age}</p>}
            {pet.birthDate && <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(pet.birthDate)}</p>}
          </div>
        </div>

        {pet.notes && <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">{pet.notes}</p>}

        <div className="flex gap-2">
          <Button onClick={() => onSelect(pet)} className="flex-1">{t("records")}</Button>
          <Button variant="outline" onClick={() => setEditOpen(true)}>{t("edit")}</Button>
          <Button variant="danger" onClick={() => deletePet(pet.id)}>{t("delete")}</Button>
        </div>
      </motion.div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title={t("editPetTitle")}>
        <PetForm onClose={() => setEditOpen(false)} existingPet={pet} />
      </Modal>
    </>
  );
}

export default PetCard;