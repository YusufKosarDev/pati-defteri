import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { usePet } from "../../hooks/usePet";
import Button from "./Button";

function ExportButton({ pet }) {
  const { getRecordsByPet, getWeightsByPet } = usePet();
  const { i18n } = useTranslation();
  const isEN = i18n.language === "en";
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      // jsPDF + html2canvas ağır bir bundle (~340 KB); sadece kullanıcı tıklayınca yükle.
      const { generatePetPdf } = await import("../../lib/pdfExport");
      await generatePetPdf({
        pet,
        records: getRecordsByPet(pet.id),
        weights: getWeightsByPet(pet.id),
        isEN,
      });
    } catch (err) {
      console.error(err);
      toast.error(isEN ? "Could not generate PDF." : "PDF oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={loading}>
      {loading
        ? (isEN ? "⏳ Generating..." : "⏳ Hazırlanıyor...")
        : `📄 ${isEN ? "Download PDF" : "PDF İndir"}`}
    </Button>
  );
}

export default ExportButton;
