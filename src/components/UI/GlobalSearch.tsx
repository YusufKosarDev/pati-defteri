import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { usePet } from "../../hooks/usePet";
import { useTranslation } from "react-i18next";
import { formatDate, getAvatarColor } from "../../utils/dateHelpers";
import { matchesRecordType, recordTypeLabel, type RecordTypeKey } from "../../utils/recordTypes";
import { petTypeEmoji, petTypeLabel, petTypeMatches } from "../../utils/petType";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Pet, PetRecord } from "../../types";

const RECORD_ICONS: Record<RecordTypeKey, string> = {
  mixed_vaccine: "💉",
  rabies: "🛡️",
  parasite_drop: "💧",
  flea: "🪲",
  dewormer: "🪱",
  vet_visit: "🏥",
  other: "📋",
};

function GlobalSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { pets, records } = usePet();
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === "en";
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  const q = query.toLowerCase().trim();

  const filteredPets = useMemo(
    () =>
      q
        ? pets.filter((p) =>
            p.name.toLowerCase().includes(q) ||
            p.breed?.toLowerCase().includes(q) ||
            petTypeMatches(p.type, q)
          )
        : [],
    [q, pets]
  );

  const filteredRecords = useMemo(
    () =>
      q
        ? records.filter((r) =>
            matchesRecordType(r.type, q) ||
            r.notes?.toLowerCase().includes(q)
          )
        : [],
    [q, records]
  );

  const getPetName = (petId: Id<"pets">) => pets.find((p) => p.id === petId)?.name || "";
  const getPetAvatar = (petId: Id<"pets">) => {
    const pet = pets.find((p) => p.id === petId);
    if (!pet) return null;
    return { initial: pet.name?.charAt(0).toUpperCase(), color: getAvatarColor(pet.name) };
  };

  const handleSelectPet = useCallback((pet: Pet) => {
    navigate(`/pets/${pet.id}`);
    handleClose();
  }, [navigate, handleClose]);

  const handleSelectRecord = useCallback((record: PetRecord) => {
    navigate(`/pets/${record.petId}`);
    handleClose();
  }, [navigate, handleClose]);

  // Esc kapatır; Enter ilk sonucu (önce hayvanlar, sonra kayıtlar) seçer.
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "Enter") {
        if (filteredPets.length > 0) handleSelectPet(filteredPets[0]);
        else if (filteredRecords.length > 0) handleSelectRecord(filteredRecords[0]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredPets, filteredRecords, handleClose, handleSelectPet, handleSelectRecord]);

  const hasResults = filteredPets.length > 0 || filteredRecords.length > 0;
  const showEmpty = q.length > 0 && !hasResults;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 flex-shrink-0">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchOpenLong")}
                className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 text-sm focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-gray-500 hover:text-gray-300 cursor-pointer text-lg leading-none">
                  ×
                </button>
              )}
              <kbd className="hidden sm:block text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-lg">ESC</kbd>
            </div>

            {/* Sonuçlar */}
            <div className="max-h-96 overflow-y-auto">
              {!q && (
                <div className="px-4 py-8 text-center text-gray-600">
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="text-sm">{t("searchPlaceholder")}</p>
                </div>
              )}

              {showEmpty && (
                <div className="px-4 py-8 text-center text-gray-600">
                  <div className="text-3xl mb-2">😔</div>
                  <p className="text-sm">{t("searchNoResults", { q: query })}</p>
                </div>
              )}

              {filteredPets.length > 0 && (
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1.5">
                    {t("searchPets")} ({filteredPets.length})
                  </p>
                  {filteredPets.map((pet) => {
                    const avatarColor = getAvatarColor(pet.name);
                    const emoji = petTypeEmoji(pet.type);
                    return (
                      <motion.button
                        key={pet.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => handleSelectPet(pet)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer text-left"
                      >
                        {pet.photo ? (
                          <img src={pet.photo} alt={pet.name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                        ) : (
                          <div className={`w-9 h-9 ${avatarColor} rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                            {pet.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-100 truncate">{pet.name} {emoji}</p>
                          <p className="text-xs text-gray-500 truncate">{petTypeLabel(pet.type, isEN)}{pet.breed ? ` · ${pet.breed}` : ""}</p>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 flex-shrink-0">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {filteredRecords.length > 0 && (
                <div className="p-2 border-t border-gray-800">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1.5">
                    {t("searchRecords")} ({filteredRecords.length})
                  </p>
                  {filteredRecords.map((record) => {
                    const avatar = getPetAvatar(record.petId);
                    return (
                      <motion.button
                        key={record.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => handleSelectRecord(record)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer text-left"
                      >
                        <div className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                          {RECORD_ICONS[record.type] || "📋"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-100 truncate">{recordTypeLabel(record.type, isEN)}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {getPetName(record.petId)} · {formatDate(record.date)}
                          </p>
                        </div>
                        {avatar && (
                          <div className={`w-6 h-6 ${avatar.color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {avatar.initial}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-gray-800 flex items-center gap-4">
              <span className="text-xs text-gray-600">{t("searchPressEnter")} <kbd className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded text-xs">↵</kbd> {t("searchToSelect")}</span>
              <span className="text-xs text-gray-600">{t("searchPressEnter")} <kbd className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded text-xs">ESC</kbd> {t("searchToClose")}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default GlobalSearch;
