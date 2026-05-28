import { createContext, useContext } from "react";
import type { PetContextValue } from "../types";

export const PetContext = createContext<PetContextValue | null>(null);

export function usePet(): PetContextValue {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error("usePet must be used within a PetProvider");
  return ctx;
}
