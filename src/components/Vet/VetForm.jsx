import { useState } from "react";
import { usePet } from "../../context/PetContext";
import { useTranslation } from "react-i18next";
import Button from "../UI/Button";

function VetForm({ petId, onClose, existingVet = null, vetIndex = null }) {
  const { updatePet, pets } = usePet();
  const { i18n } = useTranslation();
  const isEN = i18n.language === "en";
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
    const currentVets = pet.vets || (pet.vet ? [pet.vet] : []);

    let updatedVets;
    if (vetIndex !== null) {
      updatedVets = currentVets.map((v, i) => (i === vetIndex ? form : v));
    } else {
      updatedVets = [...currentVets, form];
    }

    updatePet(petId, { ...pet, vets: updatedVets, vet: undefined });
    onClose();
  };

  const inputClass = "w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-gray-500";
  const labelClass = "block text-sm font-medium text-gray-400 mb-1";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>{isEN ? "Clinic Name" : "Klinik Adı"}</label>
        <input name="clinicName" value={form.clinicName} onChange={handleChange} className={inputClass} placeholder={isEN ? "e.g. Happy Paws Clinic" : "Örn: Dostlar Veteriner Kliniği"} />
      </div>
      <div>
        <label className={labelClass}>{isEN ? "Doctor Name" : "Doktor Adı"}</label>
        <input name="doctorName" value={form.doctorName} onChange={handleChange} className={inputClass} placeholder={isEN ? "e.g. Dr. John Smith" : "Örn: Dr. Ahmet Yılmaz"} />
      </div>
      <div>
        <label className={labelClass}>{isEN ? "Phone" : "Telefon"}</label>
        <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder={isEN ? "e.g. +1 555 123 4567" : "Örn: 0532 123 45 67"} type="tel" />
      </div>
      <div>
        <label className={labelClass}>{isEN ? "Address" : "Adres"}</label>
        <input name="address" value={form.address} onChange={handleChange} className={inputClass} placeholder={isEN ? "e.g. 123 Main St, New York" : "Örn: Kadıköy, İstanbul"} />
      </div>
      <div>
        <label className={labelClass}>{isEN ? "Notes" : "Notlar"}</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} className={inputClass} rows={2} placeholder={isEN ? "e.g. Call in emergencies" : "Örn: Acil durumda ara"} />
      </div>
      <div className="flex gap-2 justify-end mt-2">
        <Button variant="secondary" onClick={onClose}>{isEN ? "Cancel" : "İptal"}</Button>
        <Button type="submit">{existingVet ? (isEN ? "Update" : "Güncelle") : (isEN ? "Save" : "Kaydet")}</Button>
      </div>
    </form>
  );
}

export default VetForm;