import { motion } from "framer-motion";
import { usePet } from "../../context/PetContext";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

const DEMO_DATA_TR = {
  pets: [
    {
      id: "demo_pet_1",
      name: "Pamuk",
      type: "Kedi",
      breed: "Van Kedisi",
      birthDate: "2022-03-15",
      photo: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop",
      notes: "Çok sevecen, oyun sever.",
      vets: [{
        clinicName: "Dostlar Veteriner Kliniği",
        doctorName: "Dr. Ayşe Yılmaz",
        phone: "0532 123 45 67",
        address: "Kadıköy, İstanbul",
        notes: "Acil durumda ara",
      }],
    },
    {
      id: "demo_pet_2",
      name: "Karamel",
      type: "Köpek",
      breed: "Golden Retriever",
      birthDate: "2021-07-20",
      photo: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop",
      notes: "Çok enerjik, parkta oynamayı sever.",
      vets: [{
        clinicName: "Pati Veteriner Merkezi",
        doctorName: "Dr. Mehmet Kaya",
        phone: "0533 987 65 43",
        address: "Beşiktaş, İstanbul",
        notes: "Salı günleri kapalı",
      }],
    },
  ],
  records: [
    { id: "demo_rec_1", petId: "demo_pet_1", type: "Karma Aşı", date: "2024-03-15", nextDate: "2025-03-15", notes: "Yıllık karma aşı yapıldı." },
    { id: "demo_rec_2", petId: "demo_pet_1", type: "Kuduz Aşısı", date: "2024-03-15", nextDate: "2025-03-15", notes: "" },
    { id: "demo_rec_3", petId: "demo_pet_1", type: "Parazit Damlası", date: "2025-01-10", nextDate: "2025-04-10", notes: "Frontline Plus kullanıldı." },
    { id: "demo_rec_4", petId: "demo_pet_1", type: "Veteriner Ziyareti", date: "2024-11-20", nextDate: "", notes: "Genel kontrol, her şey normal." },
    { id: "demo_rec_5", petId: "demo_pet_2", type: "Karma Aşı", date: "2024-07-20", nextDate: "2025-07-20", notes: "Yıllık aşılar yapıldı." },
    { id: "demo_rec_6", petId: "demo_pet_2", type: "Kuduz Aşısı", date: "2024-07-20", nextDate: "2025-07-20", notes: "" },
    { id: "demo_rec_7", petId: "demo_pet_2", type: "Kurtluk İlacı", date: "2025-01-05", nextDate: "2025-04-05", notes: "Drontal Plus verildi." },
    { id: "demo_rec_8", petId: "demo_pet_2", type: "Parazit Damlası", date: "2025-02-01", nextDate: "2025-05-01", notes: "" },
  ],
  weights: [
    { id: "demo_w_1", petId: "demo_pet_1", weight: "3.8", date: "2024-06-01", notes: "" },
    { id: "demo_w_2", petId: "demo_pet_1", weight: "3.9", date: "2024-09-01", notes: "" },
    { id: "demo_w_3", petId: "demo_pet_1", weight: "4.1", date: "2024-12-01", notes: "Biraz kilo aldı" },
    { id: "demo_w_4", petId: "demo_pet_1", weight: "4.0", date: "2025-03-01", notes: "" },
    { id: "demo_w_5", petId: "demo_pet_2", weight: "28.5", date: "2024-06-01", notes: "" },
    { id: "demo_w_6", petId: "demo_pet_2", weight: "29.0", date: "2024-09-01", notes: "" },
    { id: "demo_w_7", petId: "demo_pet_2", weight: "29.8", date: "2024-12-01", notes: "" },
    { id: "demo_w_8", petId: "demo_pet_2", weight: "30.2", date: "2025-03-01", notes: "Hafif fazla, diyet başlandı" },
  ],
};

const DEMO_DATA_EN = {
  pets: [
    {
      id: "demo_pet_1",
      name: "Snowball",
      type: "Cat",
      breed: "Turkish Van",
      birthDate: "2022-03-15",
      photo: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop",
      notes: "Very affectionate and playful.",
      vets: [{
        clinicName: "Happy Paws Veterinary Clinic",
        doctorName: "Dr. Sarah Johnson",
        phone: "555-123-4567",
        address: "123 Main St, New York",
        notes: "Call in emergencies",
      }],
    },
    {
      id: "demo_pet_2",
      name: "Caramel",
      type: "Dog",
      breed: "Golden Retriever",
      birthDate: "2021-07-20",
      photo: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop",
      notes: "Very energetic, loves playing in the park.",
      vets: [{
        clinicName: "Paws & Claws Animal Hospital",
        doctorName: "Dr. Michael Brown",
        phone: "555-987-6543",
        address: "456 Oak Ave, New York",
        notes: "Closed on Tuesdays",
      }],
    },
  ],
  records: [
    { id: "demo_rec_1", petId: "demo_pet_1", type: "Mixed Vaccine", date: "2024-03-15", nextDate: "2025-03-15", notes: "Annual mixed vaccine done." },
    { id: "demo_rec_2", petId: "demo_pet_1", type: "Rabies Vaccine", date: "2024-03-15", nextDate: "2025-03-15", notes: "" },
    { id: "demo_rec_3", petId: "demo_pet_1", type: "Parasite Drop", date: "2025-01-10", nextDate: "2025-04-10", notes: "Frontline Plus applied." },
    { id: "demo_rec_4", petId: "demo_pet_1", type: "Vet Visit", date: "2024-11-20", nextDate: "", notes: "General checkup, everything normal." },
    { id: "demo_rec_5", petId: "demo_pet_2", type: "Mixed Vaccine", date: "2024-07-20", nextDate: "2025-07-20", notes: "Annual vaccines done." },
    { id: "demo_rec_6", petId: "demo_pet_2", type: "Rabies Vaccine", date: "2024-07-20", nextDate: "2025-07-20", notes: "" },
    { id: "demo_rec_7", petId: "demo_pet_2", type: "Dewormer", date: "2025-01-05", nextDate: "2025-04-05", notes: "Drontal Plus given." },
    { id: "demo_rec_8", petId: "demo_pet_2", type: "Parasite Drop", date: "2025-02-01", nextDate: "2025-05-01", notes: "" },
  ],
  weights: [
    { id: "demo_w_1", petId: "demo_pet_1", weight: "3.8", date: "2024-06-01", notes: "" },
    { id: "demo_w_2", petId: "demo_pet_1", weight: "3.9", date: "2024-09-01", notes: "" },
    { id: "demo_w_3", petId: "demo_pet_1", weight: "4.1", date: "2024-12-01", notes: "Gained a little weight" },
    { id: "demo_w_4", petId: "demo_pet_1", weight: "4.0", date: "2025-03-01", notes: "" },
    { id: "demo_w_5", petId: "demo_pet_2", weight: "28.5", date: "2024-06-01", notes: "" },
    { id: "demo_w_6", petId: "demo_pet_2", weight: "29.0", date: "2024-09-01", notes: "" },
    { id: "demo_w_7", petId: "demo_pet_2", weight: "29.8", date: "2024-12-01", notes: "" },
    { id: "demo_w_8", petId: "demo_pet_2", weight: "30.2", date: "2025-03-01", notes: "Slightly overweight, started diet" },
  ],
};

function DemoLoader({ onClose }) {
  const { setPets, setRecords, setWeights } = usePet();
  const { i18n } = useTranslation();
  const isEN = i18n.language === "en";

  const DEMO_DATA = isEN ? DEMO_DATA_EN : DEMO_DATA_TR;

  const handleLoadDemo = () => {
    onClose();
    setTimeout(() => {
      setPets(DEMO_DATA.pets);
      setRecords(DEMO_DATA.records);
      setWeights(DEMO_DATA.weights);
      toast.success(isEN ? "Demo data loaded! 🐾" : "Demo veriler yüklendi! 🐾");
    }, 100);
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