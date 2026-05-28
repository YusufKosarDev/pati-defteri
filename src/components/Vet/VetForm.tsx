import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { usePet } from "../../hooks/usePet";
import { useTranslation } from "react-i18next";
import Button from "../UI/Button";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Vet } from "../../types";

type VetFormProps = {
  petId: Id<"pets">;
  onClose: () => void;
  existingVet?: Vet | null;
  vetIndex?: number | null;
};

function VetForm({ petId, onClose, existingVet = null, vetIndex = null }: VetFormProps) {
  const { updatePet, pets } = usePet();
  const { t } = useTranslation();
  const pet = pets.find((p) => p.id === petId);
  const fid = useId();

  const [form, setForm] = useState<Vet>({
    clinicName: existingVet?.clinicName || "",
    doctorName: existingVet?.doctorName || "",
    phone: existingVet?.phone || "",
    address: existingVet?.address || "",
    notes: existingVet?.notes || "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const currentVets = pet?.vets || (pet?.vet ? [pet.vet] : []);

    let updatedVets: Vet[];
    if (vetIndex !== null) {
      updatedVets = currentVets.map((v, i) => (i === vetIndex ? form : v));
    } else {
      updatedVets = [...currentVets, form];
    }

    try {
      await updatePet(petId, { vets: updatedVets });
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
        <label htmlFor={`${fid}-clinic`} className={labelClass}>{t("vetClinic")}</label>
        <input id={`${fid}-clinic`} name="clinicName" value={form.clinicName} onChange={handleChange} className={inputClass} placeholder={t("vetClinicPlaceholder")} />
      </div>
      <div>
        <label htmlFor={`${fid}-doctor`} className={labelClass}>{t("vetDoctor")}</label>
        <input id={`${fid}-doctor`} name="doctorName" value={form.doctorName} onChange={handleChange} className={inputClass} placeholder={t("vetDoctorPlaceholder")} />
      </div>
      <div>
        <label htmlFor={`${fid}-phone`} className={labelClass}>{t("vetPhone")}</label>
        <input id={`${fid}-phone`} name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder={t("vetPhonePlaceholder")} type="tel" />
      </div>
      <div>
        <label htmlFor={`${fid}-address`} className={labelClass}>{t("vetAddress")}</label>
        <input id={`${fid}-address`} name="address" value={form.address} onChange={handleChange} className={inputClass} placeholder={t("vetAddressPlaceholder")} />
      </div>
      <div>
        <label htmlFor={`${fid}-notes`} className={labelClass}>{t("vetNotes")}</label>
        <textarea id={`${fid}-notes`} name="notes" value={form.notes} onChange={handleChange} className={inputClass} rows={2} placeholder={t("vetNotesPlaceholder")} />
      </div>
      <div className="flex gap-2 justify-end mt-2">
        <Button variant="secondary" onClick={onClose}>{t("cancel")}</Button>
        <Button type="submit">{existingVet ? t("update") : t("save")}</Button>
      </div>
    </form>
  );
}

export default VetForm;
