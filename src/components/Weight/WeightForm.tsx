import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { usePet } from "../../hooks/usePet";
import Button from "../UI/Button";
import type { Id } from "../../../convex/_generated/dataModel";

function WeightForm({ petId, onClose }: { petId: Id<"pets">; onClose: () => void }) {
  const { addWeight } = usePet();
  const { t } = useTranslation();
  const fid = useId();
  const [form, setForm] = useState({ weight: "", date: "", notes: "" });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.weight || !form.date) return;
    try {
      await addWeight({ ...form, petId });
      onClose();
    } catch {
      // Hata toast'ı PetContext'te gösterildi; modal açık kalır.
    }
  };

  const inputClass = "w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-gray-500";
  const labelClass = "block text-sm font-medium text-gray-400 mb-1";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor={`${fid}-weight`} className={labelClass}>{t("weightKg")} *</label>
        <input
          id={`${fid}-weight`}
          name="weight"
          type="number"
          step="0.1"
          min="0"
          value={form.weight}
          onChange={handleChange}
          className={inputClass}
          placeholder={t("weightKgPlaceholder")}
          required
        />
      </div>

      <div>
        <label htmlFor={`${fid}-date`} className={labelClass}>{t("weightDate")} *</label>
        <input
          id={`${fid}-date`}
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label htmlFor={`${fid}-notes`} className={labelClass}>{t("weightNotes")}</label>
        <textarea
          id={`${fid}-notes`}
          name="notes"
          value={form.notes}
          onChange={handleChange}
          className={inputClass}
          rows={2}
          placeholder={t("weightNotesPlaceholder")}
        />
      </div>

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="secondary" onClick={onClose}>{t("cancel")}</Button>
        <Button type="submit">{t("save")}</Button>
      </div>
    </form>
  );
}

export default WeightForm;
