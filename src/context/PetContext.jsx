import { createContext, useContext, useEffect } from "react";
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

  const getRecordsByPet = (petId) =>
    (records ?? []).filter((r) => r.petId === petId);

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

  const getWeightsByPet = (petId) =>
    (weights ?? []).filter((w) => w.petId === petId);

  // Geriye dönük uyumluluk: tüketiciler `id` field'ını okuyor.
  // Convex `_id` veriyor, alias olarak `id` ekleyelim.
  const adapt = (rows) =>
    (rows ?? []).map((r) => ({ ...r, id: r._id }));

  return (
    <PetContext.Provider
      value={{
        pets: adapt(pets),
        records: adapt(records),
        weights: adapt(weights),
        loading: pets === undefined || records === undefined || weights === undefined,
        addPet,
        updatePet,
        deletePet,
        addRecord,
        updateRecord,
        deleteRecord,
        reorderRecords,
        getRecordsByPet: (petId) => adapt(getRecordsByPet(petId)),
        addWeight,
        deleteWeight,
        getWeightsByPet: (petId) => adapt(getWeightsByPet(petId)),
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
