import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAuth } from "../hooks/useAuth";
import useLocalStorage from "../hooks/useLocalStorage";
import toast from "react-hot-toast";
import i18n from "../i18n/index.js";
import { api } from "../../convex/_generated/api";
import { PetContext } from "../hooks/usePet";
import { normalizePetType } from "../utils/petType";
import { normalizeRecordType } from "../utils/recordTypes";
import { friendlyError as fmtError } from "../lib/friendlyError";
import type { Id } from "../../convex/_generated/dataModel";
import type {
  Pet,
  PetRecord,
  Weight,
  PetInput,
  RecordInput,
  WeightInput,
} from "../types";

export function PetProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  const pets = useQuery(api.pets.list, isAuthenticated ? {} : "skip");
  const records = useQuery(api.records.listForUser, isAuthenticated ? {} : "skip");
  const weights = useQuery(api.weights.listForUser, isAuthenticated ? {} : "skip");

  const createPet = useMutation(api.pets.create);
  const updatePetMut = useMutation(api.pets.update);
  const removePet = useMutation(api.pets.remove);

  const createRecord = useMutation(api.records.create);
  const updateRecordMut = useMutation(api.records.update);
  const removeRecord = useMutation(api.records.remove);
  const reorderRecordsMut = useMutation(api.records.reorder);

  const createWeight = useMutation(api.weights.create);
  const removeWeight = useMutation(api.weights.remove);

  const [language, setLanguage] = useLocalStorage("language", "tr", localStorage);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const isEN = () => i18n.language === "en";

  // Convex hata mesajı yok ya da tanınmıyorsa kullanılan dile özgü genel mesaj.
  const errorFallback = () =>
    isEN() ? "Something went wrong. Please try again." : "İşlem başarısız. Lütfen tekrar deneyin.";
  const showError = (err: unknown) => fmtError(err, errorFallback());

  // Oluştur/güncelle: hata toast'ı göster + rethrow et (form açık kalsın).
  const addPet = async (pet: PetInput) => {
    try {
      await createPet(pet);
      toast.success(isEN() ? `${pet.name} added! 🐾` : `${pet.name} eklendi! 🐾`);
    } catch (err) {
      toast.error(showError(err));
      throw err;
    }
  };

  const updatePet = async (
    id: Id<"pets">,
    updatedPet: Partial<PetInput> & { clearPhoto?: boolean }
  ) => {
    try {
      await updatePetMut({ id, ...updatedPet });
      toast.success(isEN() ? "Updated! ✅" : "Güncellendi! ✅");
    } catch (err) {
      toast.error(showError(err));
      throw err;
    }
  };

  // Sil/sırala: hata toast'ı göster, yutma (çağrı noktaları fire-and-forget).
  const deletePet = async (id: Id<"pets">) => {
    const pet = (pets ?? []).find((p) => p._id === id);
    try {
      await removePet({ id });
      toast.success(isEN() ? `${pet?.name} deleted.` : `${pet?.name} silindi.`);
    } catch (err) {
      toast.error(showError(err));
    }
  };

  const addRecord = async (record: RecordInput) => {
    try {
      await createRecord(record);
      toast.success(isEN() ? "Record added! 💉" : "Kayıt eklendi! 💉");
    } catch (err) {
      toast.error(showError(err));
      throw err;
    }
  };

  const updateRecord = async (
    id: Id<"records">,
    updatedRecord: Partial<Omit<RecordInput, "petId">>
  ) => {
    try {
      await updateRecordMut({ id, ...updatedRecord });
      toast.success(isEN() ? "Record updated! ✅" : "Kayıt güncellendi! ✅");
    } catch (err) {
      toast.error(showError(err));
      throw err;
    }
  };

  const deleteRecord = async (id: Id<"records">) => {
    try {
      await removeRecord({ id });
      toast.success(isEN() ? "Record deleted." : "Kayıt silindi.");
    } catch (err) {
      toast.error(showError(err));
    }
  };

  const reorderRecords = async (orderedIds: Id<"records">[]) => {
    try {
      await reorderRecordsMut({ orderedIds });
    } catch (err) {
      toast.error(showError(err));
    }
  };

  const addWeight = async (weight: WeightInput) => {
    try {
      await createWeight(weight);
      toast.success(
        isEN() ? `${weight.weight} kg saved! ⚖️` : `${weight.weight} kg kaydedildi! ⚖️`
      );
    } catch (err) {
      toast.error(showError(err));
      throw err;
    }
  };

  const deleteWeight = async (id: Id<"weights">) => {
    try {
      await removeWeight({ id });
      toast.success(isEN() ? "Weight record deleted." : "Ağırlık kaydı silindi.");
    } catch (err) {
      toast.error(showError(err));
    }
  };

  // Geriye dönük uyumluluk: tüketiciler `id` ve `photo` field'larını okuyor.
  // Convex `_id` veriyor; photoUrl varsa onu pet.photo'nun yerine geçir.
  // useMemo ile sorgu sonucu değişmedikçe aynı referans korunuyor.
  const adaptedPets = useMemo<Pet[]>(
    () => (pets ?? []).map((r) => ({ ...r, id: r._id, photo: r.photoUrl ?? r.photo ?? "", type: normalizePetType(r.type) })),
    [pets]
  );
  const adaptedRecords = useMemo<PetRecord[]>(
    () => (records ?? []).map((r) => ({ ...r, id: r._id, type: normalizeRecordType(r.type) })),
    [records]
  );
  const adaptedWeights = useMemo<Weight[]>(
    () => (weights ?? []).map((r) => ({ ...r, id: r._id })),
    [weights]
  );

  const recordsByPet = useMemo(() => {
    const map = new Map<Id<"pets">, PetRecord[]>();
    for (const r of adaptedRecords) {
      const arr = map.get(r.petId);
      if (arr) arr.push(r);
      else map.set(r.petId, [r]);
    }
    return map;
  }, [adaptedRecords]);

  const weightsByPet = useMemo(() => {
    const map = new Map<Id<"pets">, Weight[]>();
    for (const w of adaptedWeights) {
      const arr = map.get(w.petId);
      if (arr) arr.push(w);
      else map.set(w.petId, [w]);
    }
    return map;
  }, [adaptedWeights]);

  const getRecordsByPet = useCallback(
    (petId: Id<"pets">) => recordsByPet.get(petId) ?? [],
    [recordsByPet]
  );
  const getWeightsByPet = useCallback(
    (petId: Id<"pets">) => weightsByPet.get(petId) ?? [],
    [weightsByPet]
  );

  return (
    <PetContext.Provider
      value={{
        pets: adaptedPets,
        records: adaptedRecords,
        weights: adaptedWeights,
        loading: pets === undefined || records === undefined || weights === undefined,
        addPet,
        updatePet,
        deletePet,
        addRecord,
        updateRecord,
        deleteRecord,
        reorderRecords,
        getRecordsByPet,
        addWeight,
        deleteWeight,
        getWeightsByPet,
        language,
        setLanguage,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}
