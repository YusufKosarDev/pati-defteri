import { useState } from "react";
import { usePet } from "../../context/PetContext";
import Button from "../UI/Button";

function VetForm({ petId, onClose, existingVet = null }) {
  const { updatePet, pets } = usePet();
  const pet = pets.find((p) => p.id === petId);

  const [form, setForm] = useState({
    clinicName: existingVet?.clinicName || "",
    doctorName: existingVet?.doctorName || "",
    phone: existingVet?.phone || "",
    address: existingVet?.address || "",
    notes: existingVet?.notes || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePet(petId, { ...pet, vet: form });
    onClose();
  };

  const inputClass = "w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400";
  const labelClass = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Klinik Adı</label>
        <input name="clinicName" value={form.clinicName} onChange={handleChange} className={inputClass} placeholder="Örn: Dostlar Veteriner Kliniği" />
      </div>
      <div>
        <label className={labelClass}>Doktor Adı</label>
        <input name="doctorName" value={form.doctorName} onChange={handleChange} className={inputClass} placeholder="Örn: Dr. Ahmet Yılmaz" />
      </div>
      <div>
        <label className={labelClass}>Telefon</label>
        <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder="Örn: 0532 123 45 67" type="tel" />
      </div>
      <div>
        <label className={labelClass}>Adres</label>
        <input name="address" value={form.address} onChange={handleChange} className={inputClass} placeholder="Örn: Kadıköy, İstanbul" />
      </div>
      <div>
        <label className={labelClass}>Notlar</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} className={inputClass} rows={2} placeholder="Örn: Acil durumda ara" />
      </div>
      <div className="flex gap-2 justify-end mt-2">
        <Button variant="secondary" onClick={onClose}>İptal</Button>
        <Button type="submit">{existingVet ? "Güncelle" : "Kaydet"}</Button>
      </div>
    </form>
  );
}

export default VetForm;