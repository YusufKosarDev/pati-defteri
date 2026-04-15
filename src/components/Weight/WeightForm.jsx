import { useState } from "react";
import { usePet } from "../../context/PetContext";
import Button from "../UI/Button";

function WeightForm({ petId, onClose }) {
  const { addWeight } = usePet();
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

  const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400";
  const labelClass = "block text-sm font-medium text-gray-600 mb-1";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Ağırlık (kg) *</label>
        <input
          name="weight"
          type="number"
          step="0.1"
          min="0"
          value={form.weight}
          onChange={handleChange}
          className={inputClass}
          placeholder="Örn: 4.5"
          required
        />
      </div>

      <div>
        <label className={labelClass}>Tarih *</label>
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
        <label className={labelClass}>Notlar</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          className={inputClass}
          rows={2}
          placeholder="Ek bilgi..."
        />
      </div>

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="secondary" onClick={onClose}>İptal</Button>
        <Button type="submit">Kaydet</Button>
      </div>
    </form>
  );
}

export default WeightForm;