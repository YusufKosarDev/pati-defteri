import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePet } from "../../context/PetContext";
import { calculateAge, isOverdue, isUpcoming } from "../../utils/dateHelpers";
import PetCard from "./PetCard";
import Modal from "../UI/Modal";
import PetForm from "./PetForm";
import Button from "../UI/Button";
import EmptyState from "../UI/EmptyState";

const SORT_OPTIONS = {
  tr: [
    { value: "name_asc", label: "İsim (A-Z)" },
    { value: "name_desc", label: "İsim (Z-A)" },
    { value: "age_asc", label: "En Genç" },
    { value: "age_desc", label: "En Yaşlı" },
    { value: "records_desc", label: "En Çok Kayıt" },
    { value: "urgent", label: "Acil Bakım Önce" },
  ],
  en: [
    { value: "name_asc", label: "Name (A-Z)" },
    { value: "name_desc", label: "Name (Z-A)" },
    { value: "age_asc", label: "Youngest First" },
    { value: "age_desc", label: "Oldest First" },
    { value: "records_desc", label: "Most Records" },
    { value: "urgent", label: "Urgent Care First" },
  ],
};

function PetList({ onSelectPet }) {
  const { pets, records, getRecordsByPet } = usePet();
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === "en";
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");

  const sortOptions = isEN ? SORT_OPTIONS.en : SORT_OPTIONS.tr;

  const getSortedPets = () => {
    let filtered = pets.filter((pet) =>
      pet.name.toLowerCase().includes(search.toLowerCase())
    );

    switch (sortBy) {
      case "name_asc":
        return filtered.sort((a, b) => a.name.localeCompare(b.name, "tr"));
      case "name_desc":
        return filtered.sort((a, b) => b.name.localeCompare(a.name, "tr"));
      case "age_asc":
        return filtered.sort((a, b) => {
          if (!a.birthDate) return 1;
          if (!b.birthDate) return -1;
          return new Date(b.birthDate) - new Date(a.birthDate);
        });
      case "age_desc":
        return filtered.sort((a, b) => {
          if (!a.birthDate) return 1;
          if (!b.birthDate) return -1;
          return new Date(a.birthDate) - new Date(b.birthDate);
        });
      case "records_desc":
        return filtered.sort((a, b) => {
          const aCount = getRecordsByPet(a.id).length;
          const bCount = getRecordsByPet(b.id).length;
          return bCount - aCount;
        });
      case "urgent":
        return filtered.sort((a, b) => {
          const getUrgency = (pet) => {
            const petRecords = getRecordsByPet(pet.id);
            const overdue = petRecords.filter((r) => r.nextDate && isOverdue(r.nextDate)).length;
            const upcoming = petRecords.filter((r) => r.nextDate && isUpcoming(r.nextDate)).length;
            return overdue * 2 + upcoming;
          };
          return getUrgency(b) - getUrgency(a);
        });
      default:
        return filtered;
    }
  };

  const sorted = getSortedPets();

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <h2 className="text-xl font-bold text-gray-200">{t("myPetsTitle")}</h2>
        <Button onClick={() => setAddOpen(true)}>{t("addPet")}</Button>
      </motion.div>

      {pets.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-4"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPet")}
            className="flex-1 border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-gray-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </motion.div>
      )}

      {pets.length === 0 ? (
        <EmptyState
          type="pets"
          title={t("noPets")}
          desc={t("noPetsDesc")}
          action={<Button onClick={() => setAddOpen(true)}>{t("addPet")}</Button>}
        />
      ) : sorted.length === 0 ? (
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
            {sorted.map((pet, index) => (
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