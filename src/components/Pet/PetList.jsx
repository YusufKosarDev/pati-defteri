import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePet } from "../../context/PetContext";
import PetCard from "./PetCard";
import Modal from "../UI/Modal";
import PetForm from "./PetForm";
import Button from "../UI/Button";
import EmptyState from "../UI/EmptyState";

function PetList({ onSelectPet }) {
  const { pets } = usePet();
  const { t } = useTranslation();
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = pets.filter((pet) =>
    pet.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">{t("myPetsTitle")}</h2>
        <Button onClick={() => setAddOpen(true)}>{t("addPet")}</Button>
      </motion.div>

      {pets.length > 0 && (
        <motion.input
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPet")}
          className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      )}

      {pets.length === 0 ? (
        <EmptyState
          type="pets"
          title={t("noPets")}
          desc={t("noPetsDesc")}
          action={<Button onClick={() => setAddOpen(true)}>{t("addPet")}</Button>}
        />
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-gray-400"
        >
          <div className="text-5xl mb-3">🔍</div>
          <p className="font-medium">"{search}" {t("noSearchResult")}</p>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map((pet, index) => (
              <PetCard key={pet.id} pet={pet} onSelect={onSelectPet} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title={t("addPetTitle")}>
        <PetForm onClose={() => setAddOpen(false)} />
      </Modal>
    </div>
  );
}

export default PetList;