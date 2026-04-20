import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import { calculateAge, formatDate } from "../../utils/dateHelpers";
import { usePet } from "../../context/PetContext";

function QRModal({ isOpen, onClose, pet }) {
  const { getRecordsByPet } = usePet();
  const { i18n } = useTranslation();
  const isEN = i18n.language === "en";
  const qrRef = useRef(null);

  if (!pet) return null;

  const records = getRecordsByPet(pet.id);
  const age = calculateAge(pet.birthDate);

  // QR kod için veri
  const qrData = JSON.stringify({
    name: pet.name,
    type: pet.type,
    breed: pet.breed || "",
    birthDate: pet.birthDate || "",
    age: age || "",
    vet: pet.vet ? {
      clinic: pet.vet.clinicName || "",
      doctor: pet.vet.doctorName || "",
      phone: pet.vet.phone || "",
    } : null,
    records: records.slice(0, 5).map((r) => ({
      type: r.type,
      date: r.date,
      nextDate: r.nextDate || "",
    })),
  });

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 0, 0, 400, 400);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = `${pet.name}-qr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = url;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl w-full max-w-sm p-6 text-center"
          >
            {/* Kapat */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-full flex items-center justify-center cursor-pointer transition-colors"
            >
              ×
            </button>

            {/* Başlık */}
            <div className="flex items-center gap-3 mb-6 text-left">
              {pet.photo ? (
                <img src={pet.photo} alt={pet.name} className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-lg font-bold">
                  {pet.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-100 text-lg">{pet.name}</h3>
                <p className="text-xs text-gray-500">{pet.type}{pet.breed ? ` · ${pet.breed}` : ""}{age ? ` · ${age}` : ""}</p>
              </div>
            </div>

            {/* QR Kod */}
            <div ref={qrRef} className="bg-white rounded-2xl p-4 mb-4 inline-block">
              <QRCodeSVG
                value={qrData}
                size={200}
                level="M"
                includeMargin={false}
              />
            </div>

            <p className="text-xs text-gray-500 mb-4">
              {isEN
                ? "Scan this QR code to view pet health info."
                : "Evcil hayvan sağlık bilgilerini görmek için QR kodu okutun."}
            </p>

            {/* Bilgi özeti */}
            <div className="bg-gray-800 rounded-xl p-3 mb-4 text-left">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {isEN ? "Contains" : "İçerik"}
              </p>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-300">🐾 {isEN ? "Pet info" : "Hayvan bilgisi"}</p>
                {pet.vet?.clinicName && <p className="text-xs text-gray-300">🏥 {pet.vet.clinicName}</p>}
                {records.length > 0 && (
                  <p className="text-xs text-gray-300">
                    💉 {isEN ? `Last ${Math.min(records.length, 5)} records` : `Son ${Math.min(records.length, 5)} kayıt`}
                  </p>
                )}
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors"
              >
                ⬇️ {isEN ? "Download" : "İndir"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors"
              >
                {isEN ? "Close" : "Kapat"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default QRModal;