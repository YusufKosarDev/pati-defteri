import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePet } from "../../hooks/usePet";
import Button from "../UI/Button";

function WeightForm({ petId, onClose }) {
  const { addWeight } = usePet();
  const { i18n } = useTranslation();
  const isEN = i18n.language === "en";
  const [form, setForm] = useState({ weight: "", date: "", notes: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.weight || !form.date) return;
    addWeight({ ...form, petId });
    onClose();
  };

  const inputClass = "w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-gray-500";
  const labelClass = "block text-sm font-medium text-gray-400 mb-1";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>{isEN ? "Weight (kg)" : "Ağırlık (kg)"} *</label>
        <input
          name="weight"
          type="number"
          step="0.1"
          min="0"
          value={form.weight}
          onChange={handleChange}
          className={inputClass}
          placeholder={isEN ? "e.g. 4.5" : "Örn: 4.5"}
          required
        />
      </div>

      <div>
        <label className={labelClass}>{isEN ? "Date" : "Tarih"} *</label>
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className={labelClass}>{isEN ? "Notes" : "Notlar"}</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          className={inputClass}
          rows={2}
          placeholder={isEN ? "Additional info..." : "Ek bilgi..."}
        />
      </div>

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="secondary" onClick={onClose}>{isEN ? "Cancel" : "İptal"}</Button>
        <Button type="submit">{isEN ? "Save" : "Kaydet"}</Button>
      </div>
    </form>
  );
}

export default WeightForm;
