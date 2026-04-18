import { usePet } from "../../context/PetContext";
import { formatDate, calculateAge } from "../../utils/dateHelpers";
import Button from "./Button";
import jsPDF from "jspdf";
import { useTranslation } from "react-i18next";

function ExportButton({ pet }) {
  const { getRecordsByPet, getWeightsByPet } = usePet();
  const { i18n } = useTranslation();
  const isEN = i18n.language === "en";

  const handleExport = () => {
    const doc = new jsPDF();
    const records = getRecordsByPet(pet.id);
    const weights = getWeightsByPet(pet.id);
    const age = calculateAge(pet.birthDate);

    const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
    const sortedWeights = [...weights].sort((a, b) => new Date(b.date) - new Date(a.date));

    const emerald = [16, 185, 129];
    const gray = [107, 114, 128];
    const dark = [31, 41, 55];
    const lightGray = [243, 244, 246];

    const txt = {
      title: isEN ? "PatiDefteri" : "PatiDefteri",
      subtitle: isEN ? "Pet Care Journal" : "Evcil Hayvan Bakim Gunlugu",
      created: isEN ? "Created:" : "Olusturma:",
      type: isEN ? "Type" : "Tur",
      breed: isEN ? "Breed" : "Cins",
      birth: isEN ? "Birth" : "Dogum",
      age: isEN ? "Age" : "Yas",
      note: isEN ? "Note" : "Not",
      recordsTitle: isEN ? "Vaccine & Care Records" : "Asi & Bakim Kayitlari",
      weightsTitle: isEN ? "Weight History" : "Agirlik Gecmisi",
      noRecords: isEN ? "No records yet." : "Henuz kayit yok.",
      noWeights: isEN ? "No weight records yet." : "Henuz agirlik kaydi yok.",
      done: isEN ? "Done" : "Yapildi",
      next: isEN ? "Next" : "Sonraki",
      page: isEN ? "Page" : "Sayfa",
      kg: "kg",
    };

    // Header
    doc.setFillColor(...emerald);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(txt.title, 14, 18);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(txt.subtitle, 14, 28);
    const today = new Date().toLocaleDateString(isEN ? "en-US" : "tr-TR");
    doc.setFontSize(9);
    doc.text(`${txt.created} ${today}`, 210 - 14, 28, { align: "right" });

    // Hayvan Bilgileri
    let y = 52;
    doc.setFillColor(...lightGray);
    doc.roundedRect(10, y - 7, 190, 38, 3, 3, "F");
    doc.setTextColor(...dark);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`${pet.name}`, 18, y + 2);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray);
    doc.text(`${txt.type}: ${pet.type}${pet.breed ? `  |  ${txt.breed}: ${pet.breed}` : ""}`, 18, y + 12);
    if (pet.birthDate) doc.text(`${txt.birth}: ${formatDate(pet.birthDate)}  |  ${txt.age}: ${age || "-"}`, 18, y + 21);
    if (pet.notes) doc.text(`${txt.note}: ${pet.notes}`, 18, y + 30);
    y += 48;

    // Kayıtlar
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...emerald);
    doc.text(txt.recordsTitle, 14, y);
    y += 2;
    doc.setDrawColor(...emerald);
    doc.setLineWidth(0.5);
    doc.line(14, y, 196, y);
    y += 7;

    if (sortedRecords.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(...gray);
      doc.setFont("helvetica", "italic");
      doc.text(txt.noRecords, 14, y);
      y += 12;
    } else {
      doc.setFillColor(...emerald);
      doc.rect(10, y - 5, 190, 9, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(isEN ? "Type" : "Tur", 14, y);
      doc.text(txt.done, 80, y);
      doc.text(txt.next, 130, y);
      y += 7;

      sortedRecords.forEach((r, i) => {
        if (y > 270) { doc.addPage(); y = 20; }
        if (i % 2 === 0) {
          doc.setFillColor(...lightGray);
          doc.rect(10, y - 5, 190, 8, "F");
        }
        doc.setTextColor(...dark);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(r.type, 14, y);
        doc.text(formatDate(r.date), 80, y);
        doc.text(r.nextDate ? formatDate(r.nextDate) : "-", 130, y);
        y += 9;
        if (r.notes) {
          doc.setTextColor(...gray);
          doc.setFontSize(8);
          doc.setFont("helvetica", "italic");
          doc.text(`  ${txt.note}: ${r.notes}`, 14, y);
          y += 7;
        }
      });
    }

    y += 8;

    // Ağırlık
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...emerald);
    doc.text(txt.weightsTitle, 14, y);
    y += 2;
    doc.setDrawColor(...emerald);
    doc.line(14, y, 196, y);
    y += 7;

    if (sortedWeights.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(...gray);
      doc.setFont("helvetica", "italic");
      doc.text(txt.noWeights, 14, y);
    } else {
      doc.setFillColor(...emerald);
      doc.rect(10, y - 5, 190, 9, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(isEN ? "Date" : "Tarih", 14, y);
      doc.text(isEN ? "Weight (kg)" : "Agirlik (kg)", 80, y);
      doc.text(isEN ? "Note" : "Not", 130, y);
      y += 7;

      sortedWeights.forEach((w, i) => {
        if (y > 270) { doc.addPage(); y = 20; }
        if (i % 2 === 0) {
          doc.setFillColor(...lightGray);
          doc.rect(10, y - 5, 190, 8, "F");
        }
        doc.setTextColor(...dark);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(formatDate(w.date), 14, y);
        doc.text(`${w.weight} kg`, 80, y);
        doc.text(w.notes || "-", 130, y);
        y += 9;
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(...lightGray);
      doc.rect(0, 285, 210, 12, "F");
      doc.setFontSize(8);
      doc.setTextColor(...gray);
      doc.text(`${txt.title} - ${txt.subtitle}`, 14, 292);
      doc.text(`${txt.page} ${i} / ${pageCount}`, 196, 292, { align: "right" });
    }

    doc.save(`${pet.name}-${isEN ? "health-journal" : "bakim-gunlugu"}.pdf`);
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      📄 {isEN ? "Download PDF" : "PDF İndir"}
    </Button>
  );
}

export default ExportButton;