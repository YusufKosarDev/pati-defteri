import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { api } from "../../../convex/_generated/api";

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

function buildDemoData(isEN) {
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
      {
        id: "demo_rec_1", petId: "demo_pet_1",
        type: isEN ? "Mixed Vaccine" : "Karma Aşı",
        date: daysFromNow(-380), nextDate: daysFromNow(-15),
        notes: isEN ? "Annual mixed vaccine done." : "Yıllık karma aşı yapıldı.",
      },
      {
        id: "demo_rec_2", petId: "demo_pet_1",
        type: isEN ? "Rabies Vaccine" : "Kuduz Aşısı",
        date: daysFromNow(-380), nextDate: daysFromNow(-15),
        notes: "",
      },
      {
        id: "demo_rec_3", petId: "demo_pet_1",
        type: isEN ? "Parasite Drop" : "Parazit Damlası",
        date: daysFromNow(-75), nextDate: daysFromNow(15),
        notes: isEN ? "Frontline Plus applied." : "Frontline Plus kullanıldı.",
      },
      {
        id: "demo_rec_4", petId: "demo_pet_1",
        type: isEN ? "Vet Visit" : "Veteriner Ziyareti",
        date: daysFromNow(-180), nextDate: "",
        notes: isEN
          ? "General checkup, everything normal."
          : "Genel kontrol, her şey normal.",
      },
      {
        id: "demo_rec_5", petId: "demo_pet_2",
        type: isEN ? "Mixed Vaccine" : "Karma Aşı",
        date: daysFromNow(-300), nextDate: daysFromNow(65),
        notes: isEN ? "Annual vaccines done." : "Yıllık aşılar yapıldı.",
      },
      {
        id: "demo_rec_6", petId: "demo_pet_2",
        type: isEN ? "Rabies Vaccine" : "Kuduz Aşısı",
        date: daysFromNow(-300), nextDate: daysFromNow(65),
        notes: "",
      },
      {
        id: "demo_rec_7", petId: "demo_pet_2",
        type: isEN ? "Dewormer" : "Kurtluk İlacı",
        date: daysFromNow(-85), nextDate: daysFromNow(5),
        notes: isEN ? "Drontal Plus given." : "Drontal Plus verildi.",
      },
      {
        id: "demo_rec_8", petId: "demo_pet_2",
        type: isEN ? "Parasite Drop" : "Parazit Damlası",
        date: daysFromNow(-30), nextDate: daysFromNow(60),
        notes: "",
      },
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

function DemoLoader({ onClose }) {
  const replaceAll = useMutation(api.backup.replaceAll);
  const { i18n } = useTranslation();
  const isEN = i18n.language === "en";

  const handleLoadDemo = async () => {
    onClose();
    const DEMO_DATA = buildDemoData(isEN);

    const petsArg = DEMO_DATA.pets.map((p) => ({
      legacyId: p.id,
      name: p.name,
      type: p.type,
      breed: p.breed,
      birthDate: p.birthDate,
      photo: p.photo,
      notes: p.notes,
      vets: p.vets,
    }));
    const recordsArg = DEMO_DATA.records.map((r) => ({
      legacyPetId: r.petId,
      type: r.type,
      date: r.date,
      nextDate: r.nextDate || undefined,
      notes: r.notes || undefined,
    }));
    const weightsArg = DEMO_DATA.weights.map((w) => ({
      legacyPetId: w.petId,
      weight: w.weight,
      date: w.date,
      notes: w.notes || undefined,
    }));

    try {
      await replaceAll({ pets: petsArg, records: recordsArg, weights: weightsArg });
      toast.success(isEN ? "Demo data loaded! 🐾" : "Demo veriler yüklendi! 🐾");
    } catch (err) {
      console.error(err);
      toast.error(isEN ? "Could not load demo data." : "Demo veriler yüklenemedi.");
    }
  };

  const items = isEN ? [
    { emoji: "🐱", text: "Snowball — Turkish Van Cat, 3 years old" },
    { emoji: "🐶", text: "Caramel — Golden Retriever, 4 years old" },
    { emoji: "💉", text: "8 vaccine & care records" },
    { emoji: "⚖️", text: "Weight history with charts" },
    { emoji: "🏥", text: "Vet information" },
  ] : [
    { emoji: "🐱", text: "Pamuk — Van Kedisi, 3 yaşında" },
    { emoji: "🐶", text: "Karamel — Golden Retriever, 4 yaşında" },
    { emoji: "💉", text: "8 aşı & bakım kaydı" },
    { emoji: "⚖️", text: "Grafik ile ağırlık geçmişi" },
    { emoji: "🏥", text: "Veteriner bilgileri" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl w-full max-w-sm p-8 text-center"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="text-6xl mb-4"
        >
          🐾
        </motion.div>

        <h2 className="text-xl font-bold text-gray-100 mb-2">
          {isEN ? "Welcome to PatiDefteri!" : "PatiDefteri'ne Hoş Geldin!"}
        </h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          {isEN
            ? "Would you like to explore the app with sample pets and records?"
            : "Uygulamayı örnek hayvanlar ve kayıtlarla keşfetmek ister misin?"}
        </p>

        <div className="bg-gray-800 rounded-2xl p-4 mb-6 text-left">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">
            {isEN ? "Demo includes" : "Demo içeriği"}
          </p>
          <div className="flex flex-col gap-2">
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="flex items-center gap-2 text-sm text-gray-300"
              >
                <span>{item.emoji}</span>
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleLoadDemo}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl font-medium transition-all hover:scale-105 cursor-pointer text-sm"
          >
            ✨ {isEN ? "Load Demo Data" : "Demo Verileri Yükle"}
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 py-3 rounded-2xl font-medium transition-colors cursor-pointer text-sm"
          >
            {isEN ? "Start Empty" : "Boş Başla"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default DemoLoader;
