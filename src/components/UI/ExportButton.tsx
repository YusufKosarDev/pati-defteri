import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { usePet } from "../../hooks/usePet";
import Button from "./Button";
import { captureException } from "../../lib/sentry";
import type { Pet } from "../../types";

function ExportButton({ pet }: { pet: Pet }) {
  const { getRecordsByPet, getWeightsByPet } = usePet();
  const { t, i18n } = useTranslation();
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
      captureException(err);
      toast.error(t("exportPdfFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={loading}>
      {loading ? t("exportPdfGenerating") : t("pdfDownload")}
    </Button>
  );
}

export default ExportButton;
