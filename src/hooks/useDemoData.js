import { useMutation } from "convex/react";
import { useTranslation } from "react-i18next";
import { api } from "../../convex/_generated/api";

function daysFromNow(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function yearsAgo(years, monthOffset = 0) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setMonth(d.getMonth() + monthOffset);
  return d.toISOString().slice(0, 10);
}

export function buildDemoData(isEN) {
  const pamukName = isEN ? "Snowball" : "Pamuk";
  const karamelName = isEN ? "Caramel" : "Karamel";
  const petType = (en, tr) => (isEN ? en : tr);

  return {
    pets: [
      {
        id: "demo_pet_1",
        name: pamukName,
        type: petType("Cat", "Kedi"),
        breed: petType("Turkish Van", "Van Kedisi"),
        birthDate: yearsAgo(3, 2),
        photo: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop",
        notes: isEN ? "Very affectionate and playful." : "Çok sevecen, oyun sever.",
        vets: [{
          clinicName: isEN ? "Happy Paws Veterinary Clinic" : "Dostlar Veteriner Kliniği",
          doctorName: isEN ? "Dr. Sarah Johnson" : "Dr. Ayşe Yılmaz",
          phone: isEN ? "555-123-4567" : "0532 123 45 67",
          address: isEN ? "123 Main St, New York" : "Kadıköy, İstanbul",
          notes: isEN ? "Call in emergencies" : "Acil durumda ara",
        }],
      },
      {
        id: "demo_pet_2",
        name: karamelName,
        type: petType("Dog", "Köpek"),
        breed: "Golden Retriever",
        birthDate: yearsAgo(4, -3),
        photo: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop",
        notes: isEN
          ? "Very energetic, loves playing in the park."
          : "Çok enerjik, parkta oynamayı sever.",
        vets: [{
          clinicName: isEN ? "Paws & Claws Animal Hospital" : "Pati Veteriner Merkezi",
          doctorName: isEN ? "Dr. Michael Brown" : "Dr. Mehmet Kaya",
          phone: isEN ? "555-987-6543" : "0533 987 65 43",
          address: isEN ? "456 Oak Ave, New York" : "Beşiktaş, İstanbul",
          notes: isEN ? "Closed on Tuesdays" : "Salı günleri kapalı",
        }],
      },
    ],
    records: [
      { id: "demo_rec_1", petId: "demo_pet_1", type: isEN ? "Mixed Vaccine" : "Karma Aşı", date: daysFromNow(-380), nextDate: daysFromNow(-15), notes: isEN ? "Annual mixed vaccine done." : "Yıllık karma aşı yapıldı." },
      { id: "demo_rec_2", petId: "demo_pet_1", type: isEN ? "Rabies Vaccine" : "Kuduz Aşısı", date: daysFromNow(-380), nextDate: daysFromNow(-15), notes: "" },
      { id: "demo_rec_3", petId: "demo_pet_1", type: isEN ? "Parasite Drop" : "Parazit Damlası", date: daysFromNow(-75), nextDate: daysFromNow(15), notes: isEN ? "Frontline Plus applied." : "Frontline Plus kullanıldı." },
      { id: "demo_rec_4", petId: "demo_pet_1", type: isEN ? "Vet Visit" : "Veteriner Ziyareti", date: daysFromNow(-180), nextDate: "", notes: isEN ? "General checkup, everything normal." : "Genel kontrol, her şey normal." },
      { id: "demo_rec_5", petId: "demo_pet_2", type: isEN ? "Mixed Vaccine" : "Karma Aşı", date: daysFromNow(-300), nextDate: daysFromNow(65), notes: isEN ? "Annual vaccines done." : "Yıllık aşılar yapıldı." },
      { id: "demo_rec_6", petId: "demo_pet_2", type: isEN ? "Rabies Vaccine" : "Kuduz Aşısı", date: daysFromNow(-300), nextDate: daysFromNow(65), notes: "" },
      { id: "demo_rec_7", petId: "demo_pet_2", type: isEN ? "Dewormer" : "Kurtluk İlacı", date: daysFromNow(-85), nextDate: daysFromNow(5), notes: isEN ? "Drontal Plus given." : "Drontal Plus verildi." },
      { id: "demo_rec_8", petId: "demo_pet_2", type: isEN ? "Parasite Drop" : "Parazit Damlası", date: daysFromNow(-30), nextDate: daysFromNow(60), notes: "" },
    ],
    weights: [
      { id: "demo_w_1", petId: "demo_pet_1", weight: "3.8", date: daysFromNow(-330), notes: "" },
      { id: "demo_w_2", petId: "demo_pet_1", weight: "3.9", date: daysFromNow(-240), notes: "" },
      { id: "demo_w_3", petId: "demo_pet_1", weight: "4.1", date: daysFromNow(-150), notes: isEN ? "Gained a little weight" : "Biraz kilo aldı" },
      { id: "demo_w_4", petId: "demo_pet_1", weight: "4.0", date: daysFromNow(-60), notes: "" },
      { id: "demo_w_5", petId: "demo_pet_2", weight: "28.5", date: daysFromNow(-330), notes: "" },
      { id: "demo_w_6", petId: "demo_pet_2", weight: "29.0", date: daysFromNow(-240), notes: "" },
      { id: "demo_w_7", petId: "demo_pet_2", weight: "29.8", date: daysFromNow(-150), notes: "" },
      { id: "demo_w_8", petId: "demo_pet_2", weight: "30.2", date: daysFromNow(-60), notes: isEN ? "Slightly overweight, started diet" : "Hafif fazla, diyet başlandı" },
    ],
  };
}

export function useLoadDemoData() {
  const replaceAll = useMutation(api.backup.replaceAll);
  const { i18n } = useTranslation();
  const isEN = i18n.language === "en";

  return async function loadDemoData() {
    const data = buildDemoData(isEN);
    const petsArg = data.pets.map((p) => ({
      legacyId: p.id,
      name: p.name,
      type: p.type,
      breed: p.breed,
      birthDate: p.birthDate,
      photo: p.photo,
      notes: p.notes,
      vets: p.vets,
    }));
    const recordsArg = data.records.map((r) => ({
      legacyPetId: r.petId,
      type: r.type,
      date: r.date,
      nextDate: r.nextDate || undefined,
      notes: r.notes || undefined,
    }));
    const weightsArg = data.weights.map((w) => ({
      legacyPetId: w.petId,
      weight: w.weight,
      date: w.date,
      notes: w.notes || undefined,
    }));

    return await replaceAll({ pets: petsArg, records: recordsArg, weights: weightsArg });
  };
}
