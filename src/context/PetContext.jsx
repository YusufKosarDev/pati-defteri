import { createContext, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import useLocalStorage from "../hooks/useLocalStorage";
import toast from "react-hot-toast";
import i18n from "../i18n/index.js";

const PetContext = createContext();

export function PetProvider({ children }) {
  const { user } = useAuth();

  const storage = user?.isGuest ? sessionStorage : localStorage;
  const prefix = user?.id || "guest";

  const [pets, setPets] = useLocalStorage(`pets_${prefix}`, [], storage);
  const [records, setRecords] = useLocalStorage(`records_${prefix}`, [], storage);
  const [weights, setWeights] = useLocalStorage(`weights_${prefix}`, [], storage);
  const [language, setLanguage] = useLocalStorage("language", "tr", localStorage);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const isEN = () => i18n.language === "en";

  const addPet = (pet) => {
    const newPet = { ...pet, id: Date.now().toString() };
    setPets([...pets, newPet]);
    toast.success(isEN() ? `${pet.name} added! 🐾` : `${pet.name} eklendi! 🐾`);
  };

  const updatePet = (id, updatedPet) => {
    setPets(pets.map((p) => (p.id === id ? { ...p, ...updatedPet } : p)));
    toast.success(isEN() ? "Updated! ✅" : "Güncellendi! ✅");
  };

  const deletePet = (id) => {
    const pet = pets.find((p) => p.id === id);
    setPets(pets.filter((p) => p.id !== id));
    setRecords(records.filter((r) => r.petId !== id));
    setWeights(weights.filter((w) => w.petId !== id));
    toast.success(isEN() ? `${pet?.name} deleted.` : `${pet?.name} silindi.`);
  };

  const addRecord = (record) => {
    const newRecord = { ...record, id: Date.now().toString() };
    setRecords([...records, newRecord]);
    toast.success(isEN() ? "Record added! 💉" : "Kayıt eklendi! 💉");
  };

  const updateRecord = (id, updatedRecord) => {
    setRecords(records.map((r) => (r.id === id ? { ...r, ...updatedRecord } : r)));
    toast.success(isEN() ? "Record updated! ✅" : "Kayıt güncellendi! ✅");
  };

  const deleteRecord = (id) => {
    setRecords(records.filter((r) => r.id !== id));
    toast.success(isEN() ? "Record deleted." : "Kayıt silindi.");
  };

  const getRecordsByPet = (petId) => records.filter((r) => r.petId === petId);

  const addWeight = (weight) => {
    const newWeight = { ...weight, id: Date.now().toString() };
    setWeights([...weights, newWeight]);
    toast.success(isEN() ? `${weight.weight} kg saved! ⚖️` : `${weight.weight} kg kaydedildi! ⚖️`);
  };

  const deleteWeight = (id) => {
    setWeights(weights.filter((w) => w.id !== id));
    toast.success(isEN() ? "Weight record deleted." : "Ağırlık kaydı silindi.");
  };

  const getWeightsByPet = (petId) => weights.filter((w) => w.petId === petId);

  return (
    <PetContext.Provider value={{
      pets, setPets, addPet, updatePet, deletePet,
      records, setRecords, addRecord, updateRecord, deleteRecord, getRecordsByPet,
      weights, setWeights, addWeight, deleteWeight, getWeightsByPet,
      language, setLanguage,
    }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  return useContext(PetContext);
}