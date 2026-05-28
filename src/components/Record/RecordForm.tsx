import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { usePet } from "../../hooks/usePet";
import { useTranslation } from "react-i18next";
import Button from "../UI/Button";
import { RECORD_TYPE_KEYS, recordTypeLabel } from "../../utils/recordTypes";
import type { Id } from "../../../convex/_generated/dataModel";
import type { PetRecord } from "../../types";

type RecordFormProps = {
  petId: Id<"pets">;
  onClose: () => void;
  existingRecord?: PetRecord | null;
};

function RecordForm({ petId, onClose, existingRecord = null }: RecordFormProps) {
  const { addRecord, updateRecord } = usePet();
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === "en";
  const fid = useId();

  const [form, setForm] = useState<{ type: string; date: string; nextDate: string; notes: string }>({
    type: existingRecord?.type ?? RECORD_TYPE_KEYS[0],
    date: existingRecord?.date || "",
    nextDate: existingRecord?.nextDate || "",
    notes: existingRecord?.notes || "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.date) return;
    try {
      if (existingRecord) {
        await updateRecord(existingRecord.id, form);
      } else {
        await addRecord({ ...form, petId });
      }
      onClose();
    } catch {
      // Hata toast'ı PetContext'te gösterildi; modal açık kalır.
    }
  };

  const inputClass = "w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400";
  const labelClass = "block text-sm font-medium text-gray-400 mb-1";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor={`${fid}-type`} className={labelClass}>{t("recordType")}</label>
        <select id={`${fid}-type`} name="type" value={form.type} onChange={handleChange} className={inputClass}>
          {RECORD_TYPE_KEYS.map((k) => <option key={k} value={k}>{recordTypeLabel(k, isEN)}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor={`${fid}-date`} className={labelClass}>{t("recordDate")} *</label>
        <input id={`${fid}-date`} name="date" type="date" value={form.date} onChange={handleChange} className={inputClass} required />
      </div>

      <div>
        <label htmlFor={`${fid}-nextDate`} className={labelClass}>{t("recordNextDate")}</label>
        <input id={`${fid}-nextDate`} name="nextDate" type="date" value={form.nextDate} onChange={handleChange} className={inputClass} />
      </div>

      <div>
        <label htmlFor={`${fid}-notes`} className={labelClass}>{t("recordNotes")}</label>
        <textarea id={`${fid}-notes`} name="notes" value={form.notes} onChange={handleChange} className={inputClass} rows={3} placeholder={t("recordNotesPlaceholder")} />
      </div>

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="secondary" onClick={onClose}>{t("cancel")}</Button>
        <Button type="submit">{existingRecord ? t("update") : t("add")}</Button>
      </div>
    </form>
  );
}

export default RecordForm;
