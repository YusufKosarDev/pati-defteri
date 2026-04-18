import { useState } from "react";
import { usePet } from "../../context/PetContext";
import { useTranslation } from "react-i18next";
import Button from "../UI/Button";

const RECORD_TYPES_TR = [
  "Karma Aşı",
  "Kuduz Aşısı",
  "Parazit Damlası",
  "Pire İlacı",
  "Kurtluk İlacı",
  "Veteriner Ziyareti",
  "Diğer",
];

const RECORD_TYPES_EN = [
  "Mixed Vaccine",
  "Rabies Vaccine",
  "Parasite Drop",
  "Flea Medicine",
  "Dewormer",
  "Vet Visit",
  "Other",
];

function RecordForm({ petId, onClose, existingRecord = null }) {
  const { addRecord, updateRecord } = usePet();
  const { i18n } = useTranslation();
  const isEN = i18n.language === "en";
  const RECORD_TYPES = isEN ? RECORD_TYPES_EN : RECORD_TYPES_TR;

  const [form, setForm] = useState({
    type: existingRecord?.type || RECORD_TYPES[0],
    date: existingRecord?.date || "",
    nextDate: existingRecord?.nextDate || "",
    notes: existingRecord?.notes || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date) return;
    if (existingRecord) {
      updateRecord(existingRecord.id, form);
    } else {
      addRecord({ ...form, petId });
    }
    onClose();
  };

  const inputClass = "w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400";
  const labelClass = "block text-sm font-medium text-gray-400 mb-1";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>{isEN ? "Record Type" : "Kayıt Türü"}</label>
        <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
          {RECORD_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>{isEN ? "Date" : "Tarih"} *</label>
        <input name="date" type="date" value={form.date} onChange={handleChange} className={inputClass} required />
      </div>

      <div>
        <label className={labelClass}>{isEN ? "Next Date" : "Sonraki Tarih"}</label>
        <input name="nextDate" type="date" value={form.nextDate} onChange={handleChange} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>{isEN ? "Notes" : "Notlar"}</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} className={inputClass} rows={3} placeholder={isEN ? "Additional info..." : "Ek bilgiler..."} />
      </div>

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="secondary" onClick={onClose}>{isEN ? "Cancel" : "İptal"}</Button>
        <Button type="submit">{existingRecord ? (isEN ? "Update" : "Güncelle") : (isEN ? "Add" : "Ekle")}</Button>
      </div>
    </form>
  );
}

export default RecordForm;