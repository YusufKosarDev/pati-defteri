import jsPDF from "jspdf";
import { formatDate, calculateAge } from "../utils/dateHelpers";
import { ROBOTO_REGULAR_B64, ROBOTO_BOLD_B64 } from "./fonts/roboto";
import { petTypeLabel } from "../utils/petType";
import { recordTypeLabel } from "../utils/recordTypes";
import type { Pet, PetRecord, Weight } from "../types";

// Bu dosya `jspdf` + gömülü Roboto fontunu (~450KB base64) dahil eden ağır bir
// bundle yaratır. ExportButton tarafında `await import("../../lib/pdfExport")`
// ile lazy load edilir, böylece PetDetailPage ilk yüklemeye dahil etmez.

// jsPDF varsayılan helvetica fontu WinAnsi kullanır ve Türkçe karakterleri
// (çğışöü / İ) bozar. Roboto TTF'i gömerek kullanıcı verisini (isim, not, cins)
// doğru render ederiz.
function registerFont(doc: jsPDF) {
  doc.addFileToVFS("Roboto-Regular.ttf", ROBOTO_REGULAR_B64);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFileToVFS("Roboto-Bold.ttf", ROBOTO_BOLD_B64);
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
  doc.setFont("Roboto", "normal");
}

type RGB = [number, number, number];

export async function generatePetPdf({
  pet,
  records,
  weights,
  isEN,
}: {
  pet: Pet;
  records: PetRecord[];
  weights: Weight[];
  isEN: boolean;
}) {
  const doc = new jsPDF();
  registerFont(doc);

  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const sortedWeights = [...weights].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const age = calculateAge(pet.birthDate);

  const emerald: RGB = [16, 185, 129];
  const gray: RGB = [107, 114, 128];
  const dark: RGB = [31, 41, 55];
  const lightGray: RGB = [243, 244, 246];

  const txt = {
    title: "PatiDefteri",
    subtitle: isEN ? "Pet Care Journal" : "Evcil Hayvan Bakım Günlüğü",
    created: isEN ? "Created:" : "Oluşturma:",
    type: isEN ? "Type" : "Tür",
    breed: isEN ? "Breed" : "Cins",
    birth: isEN ? "Birth" : "Doğum",
    age: isEN ? "Age" : "Yaş",
    note: isEN ? "Note" : "Not",
    recordsTitle: isEN ? "Vaccine & Care Records" : "Aşı & Bakım Kayıtları",
    weightsTitle: isEN ? "Weight History" : "Ağırlık Geçmişi",
    noRecords: isEN ? "No records yet." : "Henüz kayıt yok.",
    noWeights: isEN ? "No weight records yet." : "Henüz ağırlık kaydı yok.",
    done: isEN ? "Done" : "Yapıldı",
    next: isEN ? "Next" : "Sonraki",
    page: isEN ? "Page" : "Sayfa",
  };

  // Header
  doc.setFillColor(...emerald);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("Roboto", "bold");
  doc.text(txt.title, 14, 18);
  doc.setFontSize(11);
  doc.setFont("Roboto", "normal");
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
  doc.setFont("Roboto", "bold");
  doc.text(`${pet.name}`, 18, y + 2);
  doc.setFontSize(10);
  doc.setFont("Roboto", "normal");
  doc.setTextColor(...gray);
  doc.text(`${txt.type}: ${petTypeLabel(pet.type, isEN)}${pet.breed ? `  |  ${txt.breed}: ${pet.breed}` : ""}`, 18, y + 12);
  if (pet.birthDate) doc.text(`${txt.birth}: ${formatDate(pet.birthDate)}  |  ${txt.age}: ${age || "-"}`, 18, y + 21);
  if (pet.notes) doc.text(`${txt.note}: ${pet.notes}`, 18, y + 30);
  y += 48;

  // Kayıtlar
  doc.setFontSize(13);
  doc.setFont("Roboto", "bold");
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
    doc.setFont("Roboto", "normal");
    doc.text(txt.noRecords, 14, y);
    y += 12;
  } else {
    doc.setFillColor(...emerald);
    doc.rect(10, y - 5, 190, 9, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("Roboto", "bold");
    doc.text(isEN ? "Type" : "Tür", 14, y);
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
      doc.setFont("Roboto", "normal");
      doc.text(recordTypeLabel(r.type, isEN), 14, y);
      doc.text(formatDate(r.date), 80, y);
      doc.text(r.nextDate ? formatDate(r.nextDate) : "-", 130, y);
      y += 9;
      if (r.notes) {
        doc.setTextColor(...gray);
        doc.setFontSize(8);
        doc.setFont("Roboto", "normal");
        doc.text(`  ${txt.note}: ${r.notes}`, 14, y);
        y += 7;
      }
    });
  }

  y += 8;

  // Ağırlık
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setFontSize(13);
  doc.setFont("Roboto", "bold");
  doc.setTextColor(...emerald);
  doc.text(txt.weightsTitle, 14, y);
  y += 2;
  doc.setDrawColor(...emerald);
  doc.line(14, y, 196, y);
  y += 7;

  if (sortedWeights.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(...gray);
    doc.setFont("Roboto", "normal");
    doc.text(txt.noWeights, 14, y);
  } else {
    doc.setFillColor(...emerald);
    doc.rect(10, y - 5, 190, 9, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("Roboto", "bold");
    doc.text(isEN ? "Date" : "Tarih", 14, y);
    doc.text(isEN ? "Weight (kg)" : "Ağırlık (kg)", 80, y);
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
      doc.setFont("Roboto", "normal");
      doc.text(formatDate(w.date), 14, y);
      doc.text(`${w.weight} kg`, 80, y);
      doc.text(w.notes || "-", 130, y);
      y += 9;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
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
}
