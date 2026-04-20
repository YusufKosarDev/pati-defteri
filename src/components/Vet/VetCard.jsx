import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePet } from "../../context/PetContext";
import Modal from "../UI/Modal";
import VetForm from "./VetForm";
import Button from "../UI/Button";
import ConfirmModal from "../UI/ConfirmModal";

function SingleVetCard({ vet, index, pet, isEN, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);

  const handleCopyPhone = () => {
    if (!vet?.phone) return;
    navigator.clipboard.writeText(vet.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden"
    >
      {/* Klinik Header */}
      {vet.clinicName && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
              🏥
            </div>
            <div>
              <p className="text-xs text-emerald-400 font-medium uppercase tracking-wider">
                {isEN ? "Clinic" : "Klinik"}
              </p>
              <p className="text-base font-bold text-gray-100">{vet.clinicName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(index)}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
            >
              {isEN ? "Edit" : "Düzenle"}
            </button>
            <button
              onClick={() => onDelete(index)}
              className="text-xs bg-red-950 hover:bg-red-900 text-red-400 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
            >
              {isEN ? "Delete" : "Sil"}
            </button>
          </div>
        </div>
      )}

      <div className="p-5 flex flex-col gap-4">
        {/* Başlık yoksa düzenle/sil butonları */}
        {!vet.clinicName && (
          <div className="flex justify-end gap-2">
            <button onClick={() => onEdit(index)} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors">
              {isEN ? "Edit" : "Düzenle"}
            </button>
            <button onClick={() => onDelete(index)} className="text-xs bg-red-950 hover:bg-red-900 text-red-400 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors">
              {isEN ? "Delete" : "Sil"}
            </button>
          </div>
        )}

        {vet.doctorName && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🩺</div>
            <div>
              <p className="text-xs text-gray-500">{isEN ? "Doctor" : "Doktor"}</p>
              <p className="text-sm font-semibold text-gray-100">{vet.doctorName}</p>
            </div>
          </div>
        )}

        {vet.phone && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-500/10 rounded-xl flex items-center justify-center text-lg flex-shrink-0">📞</div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">{isEN ? "Phone" : "Telefon"}</p>
              <p className="text-sm font-semibold text-gray-100">{vet.phone}</p>
            </div>
            <div className="flex gap-2">
              <a href={`tel:${vet.phone}`} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors">
                {isEN ? "Call" : "Ara"}
              </a>
              <button onClick={handleCopyPhone} className="bg-gray-800 hover:bg-gray-700 text-gray-400 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer">
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span key="copied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-emerald-400">✓</motion.span>
                  ) : (
                    <motion.span key="copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {isEN ? "Copy" : "Kopyala"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        )}

        {vet.address && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center text-lg flex-shrink-0">📍</div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">{isEN ? "Address" : "Adres"}</p>
              <p className="text-sm font-semibold text-gray-100">{vet.address}</p>
            </div>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(vet.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex-shrink-0"
            >
              {isEN ? "Maps" : "Harita"}
            </a>
          </div>
        )}

        {vet.notes && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center text-lg flex-shrink-0 mt-0.5">🗒️</div>
            <div>
              <p className="text-xs text-gray-500">{isEN ? "Notes" : "Notlar"}</p>
              <p className="text-sm text-gray-300 leading-relaxed">{vet.notes}</p>
            </div>
          </div>
        )}
      </div>

      {(vet.phone || vet.address) && (
        <div className="border-t border-gray-800 px-5 py-3 flex gap-3">
          {vet.phone && (
            <a href={`tel:${vet.phone}`} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium text-center transition-colors">
              📞 {isEN ? "Call Now" : "Hemen Ara"}
            </a>
          )}
          {vet.address && (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(vet.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl text-sm font-medium text-center transition-colors"
            >
              📍 {isEN ? "Get Directions" : "Yol Tarifi"}
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}

function VetCard({ pet }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const { updatePet } = usePet();
  const { i18n } = useTranslation();
  const isEN = i18n.language === "en";

  // Geriye dönük uyumluluk: eski pet.vet → pet.vets
  const vets = pet.vets || (pet.vet && (pet.vet.clinicName || pet.vet.doctorName || pet.vet.phone) ? [pet.vet] : []);

  const handleDelete = (index) => {
    const updatedVets = vets.filter((_, i) => i !== index);
    updatePet(pet.id, { ...pet, vets: updatedVets });
    setDeleteIndex(null);
  };

  if (vets.length === 0) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl border border-dashed border-gray-700 p-10 text-center"
        >
          <div className="text-5xl mb-3">🏥</div>
          <p className="text-gray-400 text-sm mb-2 font-medium">
            {isEN ? "No veterinarian info added yet." : "Henüz veteriner bilgisi eklenmedi."}
          </p>
          <p className="text-gray-600 text-xs mb-5">
            {isEN ? "Add your vet's contact info for quick access." : "Hızlı erişim için veterinerinizin iletişim bilgilerini ekleyin."}
          </p>
          <Button onClick={() => setAddOpen(true)}>
            + {isEN ? "Add Veterinarian" : "Veteriner Ekle"}
          </Button>
        </motion.div>

        <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title={isEN ? "Add Veterinarian" : "Veteriner Ekle"}>
          <VetForm petId={pet.id} onClose={() => setAddOpen(false)} />
        </Modal>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-100">
            🏥 {isEN ? "Veterinarians" : "Veterinerler"} ({vets.length})
          </h3>
          <Button onClick={() => setAddOpen(true)}>
            + {isEN ? "Add New" : "Yeni Ekle"}
          </Button>
        </div>

        {vets.map((vet, index) => (
          <SingleVetCard
            key={index}
            vet={vet}
            index={index}
            pet={pet}
            isEN={isEN}
            onEdit={(i) => setEditIndex(i)}
            onDelete={(i) => setDeleteIndex(i)}
          />
        ))}
      </div>

      {/* Yeni veteriner ekle */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title={isEN ? "Add Veterinarian" : "Veteriner Ekle"}>
        <VetForm petId={pet.id} onClose={() => setAddOpen(false)} />
      </Modal>

      {/* Veteriner düzenle */}
      <Modal isOpen={editIndex !== null} onClose={() => setEditIndex(null)} title={isEN ? "Edit Veterinarian" : "Veteriner Düzenle"}>
        <VetForm
          petId={pet.id}
          onClose={() => setEditIndex(null)}
          existingVet={editIndex !== null ? vets[editIndex] : null}
          vetIndex={editIndex}
        />
      </Modal>

      {/* Sil onayı */}
      <ConfirmModal
        isOpen={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        onConfirm={() => handleDelete(deleteIndex)}
        title={isEN ? "Delete Veterinarian?" : "Veteriner Silinsin mi?"}
        desc={isEN ? "This veterinarian info will be permanently deleted." : "Bu veteriner bilgisi kalıcı olarak silinecek."}
        confirmText={isEN ? "Delete" : "Sil"}
      />
    </>
  );
}

export default VetCard;