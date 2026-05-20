import { createContext, useContext } from "react";

export const PetContext = createContext(null);

export function usePet() {
  return useContext(PetContext);
}
