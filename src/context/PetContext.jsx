import { createContext, useContext, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import toast from "react-hot-toast";
import i18n from "../i18n/index.js";

const PetContext = createContext();

export function PetProvider({ children }) {
  const [pets, setPets] = useLocalStorage("pets", []);
  const [records, setRecords] = useLocalStorage("records", []);
  const [weights, setWeights] = useLocalStorage("weights", []);
  const [darkMode, setDarkMode] = useLocalStorage("darkMode", false);
  const [language, setLanguage] = useLocalStorage("language", "tr");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const addPet = (pet) => {
    const newPet = { ...pet, id: Date.now().toString() };
    setPets([...pets, newPet]);
    toast.success(`${pet.name} ${i18n.t("toastPetAdded")}`);
  };

  const updatePet = (id, updatedPet) => {
    setPets(pets.map((p) => (p.id === id ? { ...p, ...updatedPet } : p)));
    toast.success(i18n.t("toastPetUpdated"));
  };

  const deletePet = (id) => {
    const pet = pets.find((p) => p.id === id);
    setPets(pets.filter((p) => p.id !== id));
    setRecords(records.filter((r) => r.petId !== id));
    setWeights(weights.filter((w) => w.petId !== id));
    toast.success(`${pet?.name} silindi.`);
  };

  const addRecord = (record) => {
    const newRecord = { ...record, id: Date.now().toString() };
    setRecords([...records, newRecord]);
    toast.success(i18n.t("toastRecordAdded"));
  };

  const updateRecord = (id, updatedRecord) => {
    setRecords(records.map((r) => (r.id === id ? { ...r, ...updatedRecord } : r)));
    toast.success(i18n.t("toastRecordUpdated"));
  };

  const deleteRecord = (id) => {
    setRecords(records.filter((r) => r.id !== id));
    toast.success(i18n.t("toastRecordDeleted"));
  };

  const getRecordsByPet = (petId) => records.filter((r) => r.petId === petId);

  const addWeight = (weight) => {
    const newWeight = { ...weight, id: Date.now().toString() };
    setWeights([...weights, newWeight]);
    toast.success(`${weight.weight} ${i18n.t("toastWeightAdded")}`);
  };

  const deleteWeight = (id) => {
    setWeights(weights.filter((w) => w.id !== id));
    toast.success(i18n.t("toastWeightDeleted"));
  };

  const getWeightsByPet = (petId) => weights.filter((w) => w.petId === petId);

  return (
    <PetContext.Provider value={{
      pets, setPets, addPet, updatePet, deletePet,
      records, setRecords, addRecord, updateRecord, deleteRecord, getRecordsByPet,
      weights, setWeights, addWeight, deleteWeight, getWeightsByPet,
      darkMode, setDarkMode,
      language, setLanguage,
    }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  return useContext(PetContext);
}