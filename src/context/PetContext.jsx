import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAuth } from "./AuthContext";
import useLocalStorage from "../hooks/useLocalStorage";
import toast from "react-hot-toast";
import i18n from "../i18n/index.js";
import { api } from "../../convex/_generated/api";

const PetContext = createContext();

export function PetProvider({ children }) {
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

  const addPet = async (pet) => {
    await createPet(pet);
    toast.success(isEN() ? `${pet.name} added! 🐾` : `${pet.name} eklendi! 🐾`);
  };

  const updatePet = async (id, updatedPet) => {
    await updatePetMut({ id, ...updatedPet });
    toast.success(isEN() ? "Updated! ✅" : "Güncellendi! ✅");
  };

  const deletePet = async (id) => {
    const pet = (pets ?? []).find((p) => p._id === id);
    await removePet({ id });
    toast.success(isEN() ? `${pet?.name} deleted.` : `${pet?.name} silindi.`);
  };

  const addRecord = async (record) => {
    await createRecord(record);
    toast.success(isEN() ? "Record added! 💉" : "Kayıt eklendi! 💉");
  };

  const updateRecord = async (id, updatedRecord) => {
    await updateRecordMut({ id, ...updatedRecord });
    toast.success(isEN() ? "Record updated! ✅" : "Kayıt güncellendi! ✅");
  };

  const deleteRecord = async (id) => {
    await removeRecord({ id });
    toast.success(isEN() ? "Record deleted." : "Kayıt silindi.");
  };

  const reorderRecords = async (orderedIds) => {
    await reorderRecordsMut({ orderedIds });
  };

  const addWeight = async (weight) => {
    await createWeight(weight);
    toast.success(
      isEN() ? `${weight.weight} kg saved! ⚖️` : `${weight.weight} kg kaydedildi! ⚖️`
    );
  };

  const deleteWeight = async (id) => {
    await removeWeight({ id });
    toast.success(isEN() ? "Weight record deleted." : "Ağırlık kaydı silindi.");
  };

  // Geriye dönük uyumluluk: tüketiciler `id` ve `photo` field'larını okuyor.
  // Convex `_id` veriyor; photoUrl varsa onu pet.photo'nun yerine geçir.
  // useMemo ile sorgu sonucu değişmedikçe aynı referans korunuyor.
  const adaptedPets = useMemo(
    () => (pets ?? []).map((r) => ({ ...r, id: r._id, photo: r.photoUrl ?? r.photo ?? "" })),
    [pets]
  );
  const adaptedRecords = useMemo(
    () => (records ?? []).map((r) => ({ ...r, id: r._id })),
    [records]
  );
  const adaptedWeights = useMemo(
    () => (weights ?? []).map((r) => ({ ...r, id: r._id })),
    [weights]
  );

  const recordsByPet = useMemo(() => {
    const map = new Map();
    for (const r of adaptedRecords) {
      const arr = map.get(r.petId);
      if (arr) arr.push(r);
      else map.set(r.petId, [r]);
    }
    return map;
  }, [adaptedRecords]);

  const weightsByPet = useMemo(() => {
    const map = new Map();
    for (const w of adaptedWeights) {
      const arr = map.get(w.petId);
      if (arr) arr.push(w);
      else map.set(w.petId, [w]);
    }
    return map;
  }, [adaptedWeights]);

  const getRecordsByPet = useCallback(
    (petId) => recordsByPet.get(petId) ?? [],
    [recordsByPet]
  );
  const getWeightsByPet = useCallback(
    (petId) => weightsByPet.get(petId) ?? [],
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

export function usePet() {
  return useContext(PetContext);
}
