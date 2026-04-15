import { useState } from "react";
import { usePet } from "../context/PetContext";
import Navbar from "../components/Layout/Navbar";
import Button from "../components/UI/Button";
import toast from "react-hot-toast";

function BackupPage() {
  const { pets, records, weights, setPets, setRecords, setWeights } = usePet();
  const [dragOver, setDragOver] = useState(false);

  const handleExport = () => {
    const data = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      pets,
      records,
      weights,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `patidefteri-yedek-${new Date().toLocaleDateString("tr-TR").replace(/\./g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Yedek dosyası indirildi! 💾");
  };

  const handleImport = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.pets || !data.records) {
          toast.error("Geçersiz yedek dosyası!");
          return;
        }
        setPets(data.pets || []);
        setRecords(data.records || []);
        setWeights(data.weights || []);
        toast.success(`Yedek yüklendi! ${data.pets.length} hayvan geri getirildi. 🐾`);
      } catch {
        toast.error("Dosya okunamadı!");
      }
    };
    reader.readAsText(file);
  };

  const stats = [
    { icon: "🐾", label: "Hayvan", count: pets.length },
    { icon: "💉", label: "Kayıt", count: records.length },
    { icon: "⚖️", label: "Ağırlık", count: weights.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">💾 Yedekleme</h1>
        <p className="text-gray-400 dark:text-gray-500 text-sm mb-8">Verilerinizi JSON olarak indirin veya geri yükleyin.</p>

        {/* İstatistikler */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{s.count}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Export */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">💾</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">Yedek Al</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Tüm hayvan, kayıt ve ağırlık verilerinizi JSON dosyası olarak indirin.</p>
              <Button onClick={handleExport}>📥 Yedek İndir</Button>
            </div>
          </div>
        </div>

        {/* Import */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">📂</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">Yedek Yükle</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                Daha önce aldığınız yedek dosyasını yükleyin.
                <span className="text-red-400 dark:text-red-500 block mt-1">⚠️ Mevcut verilerinizin üzerine yazılır!</span>
              </p>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImport(e.dataTransfer.files[0]); }}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${dragOver ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950" : "border-gray-200 dark:border-gray-700"}`}
              >
                <div className="text-3xl mb-2">📁</div>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">JSON dosyasını buraya sürükleyin</p>
                <label className="cursor-pointer">
                  <span className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                    veya dosya seç
                  </span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => handleImport(e.target.files[0])}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BackupPage;