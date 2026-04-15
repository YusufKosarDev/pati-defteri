import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePet } from "../../context/PetContext";
import useConfetti from "../../hooks/useConfetti";
import Button from "../UI/Button";

function PetForm({ onClose, existingPet = null }) {
  const { addPet, updatePet, pets } = usePet();
  const { t } = useTranslation();
  const { fireConfetti, fireStar } = useConfetti();

  const [form, setForm] = useState({
    name: existingPet?.name || "",
    type: existingPet?.type || t("petCat"),
    breed: existingPet?.breed || "",
    birthDate: existingPet?.birthDate || "",
    photo: existingPet?.photo || "",
    notes: existingPet?.notes || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    if (existingPet) {
      updatePet(existingPet.id, form);
    } else {
      addPet(form);
      // İlk hayvan eklenince konfeti, diğerlerinde yıldız
      if (pets.length === 0) {
        setTimeout(fireConfetti, 300);
      } else {
        setTimeout(fireStar, 300);
      }
    }
    onClose();
  };

  const inputClass = "w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400";
  const labelClass = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>{t("petName")} *</label>
        <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder={t("petNamePlaceholder")} required />
      </div>
      <div>
        <label className={labelClass}>{t("petType")}</label>
        <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
          <option>{t("petCat")}</option>
          <option>{t("petDog")}</option>
          <option>{t("petOther")}</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>{t("petBreed")}</label>
        <input name="breed" value={form.breed} onChange={handleChange} className={inputClass} placeholder={t("petBreedPlaceholder")} />
      </div>
      <div>
        <label className={labelClass}>{t("petBirthDate")}</label>
        <input name="birthDate" type="date" value={form.birthDate} onChange={handleChange} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("petPhoto")}</label>
        <input name="photo" value={form.photo} onChange={handleChange} className={inputClass} placeholder="https://..." />
      </div>
      <div>
        <label className={labelClass}>{t("petNotes")}</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} className={inputClass} rows={3} placeholder={t("petNotesPlaceholder")} />
      </div>
      <div className="flex gap-2 justify-end mt-2">
        <Button variant="secondary" onClick={onClose}>{t("cancel")}</Button>
        <Button type="submit">{existingPet ? t("update") : t("add")}</Button>
      </div>
    </form>
  );
}

export default PetForm;