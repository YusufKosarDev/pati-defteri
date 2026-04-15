import { useState } from "react";
import { motion } from "framer-motion";
import Modal from "../UI/Modal";
import VetForm from "./VetForm";
import Button from "../UI/Button";

const icons = {
  clinic: "🏥",
  doctor: "🩺",
  phone: "📞",
  address: "📍",
  notes: "🗒️",
};

function VetCard({ pet }) {
  const [editOpen, setEditOpen] = useState(false);
  const vet = pet.vet;

  const isEmpty = !vet || (!vet.clinicName && !vet.doctorName && !vet.phone);

  if (isEmpty) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-5 mb-6 text-center"
        >
          <div className="text-4xl mb-2">{icons.clinic}</div>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-3">
            Henüz veteriner bilgisi eklenmedi.
          </p>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            + Veteriner Ekle
          </Button>
        </motion.div>

        <Modal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          title="Veteriner Bilgisi Ekle"
        >
          <VetForm petId={pet.id} onClose={() => setEditOpen(false)} />
        </Modal>
      </>
    );
  }

  const rows = [
    { key: "clinicName", icon: icons.clinic, label: "Klinik", value: vet.clinicName, style: "bg-emerald-50 dark:bg-emerald-950" },
    { key: "doctorName", icon: icons.doctor, label: "Doktor", value: vet.doctorName, style: "bg-blue-50 dark:bg-blue-950" },
    { key: "phone", icon: icons.phone, label: "Telefon", value: vet.phone, style: "bg-violet-50 dark:bg-violet-950", isPhone: true },
    { key: "address", icon: icons.address, label: "Adres", value: vet.address, style: "bg-orange-50 dark:bg-orange-950", isAddress: true },
    { key: "notes", icon: icons.notes, label: "Not", value: vet.notes, style: "bg-gray-50 dark:bg-gray-800" },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">
            {icons.clinic} Veteriner
          </h3>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            Düzenle
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {rows.map((row) => {
            if (!row.value) return null;
            return (
              <div key={row.key} className="flex items-center gap-3">
                <span className={`w-8 h-8 ${row.style} rounded-xl flex items-center justify-center text-base flex-shrink-0`}>
                  {row.icon}
                </span>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{row.label}</p>
                  {row.isPhone ? (
                    <a href={`tel:${row.value}`} className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                      {row.value}
                    </a>
                  ) : row.isAddress ? (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(row.value)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      {row.value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{row.value}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Veteriner Bilgisini Düzenle"
      >
        <VetForm petId={pet.id} onClose={() => setEditOpen(false)} existingVet={vet} />
      </Modal>
    </>
  );
}

export default VetCard;