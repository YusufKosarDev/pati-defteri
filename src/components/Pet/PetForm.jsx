import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { usePet } from "../../context/PetContext";
import useConfetti from "../../hooks/useConfetti";
import Button from "../UI/Button";

function PetForm({ onClose, existingPet = null }) {
  const { addPet, updatePet, pets } = usePet();
  const { t } = useTranslation();
  const { fireConfetti, fireStar } = useConfetti();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: existingPet?.name || "",
    type: existingPet?.type || t("petCat"),
    breed: existingPet?.breed || "",
    birthDate: existingPet?.birthDate || "",
    photo: existingPet?.photo || "",
    notes: existingPet?.notes || "",
  });

  const [photoPreview, setPhotoPreview] = useState(existingPet?.photo || "");
  const [photoMode, setPhotoMode] = useState(existingPet?.photo?.startsWith("http") ? "url" : existingPet?.photo ? "file" : "file");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoURL = (e) => {
    const url = e.target.value;
    setForm({ ...form, photo: url });
    setPhotoPreview(url);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Dosya boyutu 2MB'dan küçük olmalı!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setForm({ ...form, photo: base64 });
      setPhotoPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setForm({ ...form, photo: "" });
    setPhotoPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    if (existingPet) {
      updatePet(existingPet.id, form);
    } else {
      addPet(form);
      if (pets.length === 0) {
        setTimeout(fireConfetti, 300);
      } else {
        setTimeout(fireStar, 300);
      }
    }
    onClose();
  };

  const inputClass = "w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-gray-500";
  const labelClass = "block text-sm font-medium text-gray-400 mb-1";

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

      {/* Fotoğraf */}
      <div>
        <label className={labelClass}>{t("petPhoto")}</label>

        {/* Mod seçici */}
        <div className="flex bg-gray-800 rounded-xl p-1 mb-3">
          <button
            type="button"
            onClick={() => setPhotoMode("file")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${photoMode === "file" ? "bg-emerald-500 text-white" : "text-gray-400 hover:text-gray-200"}`}
          >
            📁 {t("importOr") || "Dosya Seç"}
          </button>
          <button
            type="button"
            onClick={() => setPhotoMode("url")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${photoMode === "url" ? "bg-emerald-500 text-white" : "text-gray-400 hover:text-gray-200"}`}
          >
            🔗 URL
          </button>
        </div>

        {/* Önizleme */}
        {photoPreview && (
          <div className="relative mb-3 w-20 h-20">
            <img src={photoPreview} alt="Önizleme" className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500" />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {photoMode === "file" ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-700 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition-colors"
          >
            <div className="text-2xl mb-1">📷</div>
            <p className="text-xs text-gray-400">Fotoğraf seç veya sürükle</p>
            <p className="text-xs text-gray-600 mt-0.5">Max 2MB · JPG, PNG, WEBP</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <input
            name="photo"
            value={form.photo?.startsWith("data:") ? "" : form.photo}
            onChange={handlePhotoURL}
            className={inputClass}
            placeholder="https://..."
          />
        )}
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