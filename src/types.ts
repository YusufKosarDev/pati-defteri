import type { Doc, Id } from "../convex/_generated/dataModel";
import type { PetTypeKey } from "./utils/petType";
import type { RecordTypeKey } from "./utils/recordTypes";

// Uygulama genelinde paylaşılan domain tipleri. Convex'in ürettiği `Doc`
// tiplerinden türetilir; PetContext'in eklediği uyum alanları (`id`, çözülmüş
// `photo`) burada modellenir.

export type Vet = {
  clinicName?: string;
  doctorName?: string;
  phone?: string;
  address?: string;
  notes?: string;
};

/** Listeleme sorgusunun döndürdüğü + adapter'ın eklediği alanlarla zenginleştirilmiş pet. */
export type Pet = Doc<"pets"> & {
  id: Id<"pets">;
  photo: string; // adapter: photoUrl ?? photo ?? ""
  photoUrl?: string | null;
  vet?: Vet; // legacy tek-veteriner alanı (VetCard geriye dönük okur)
  type: PetTypeKey; // adapter normalize eder (legacy lokalize → anahtar)
};

export type PetRecord = Doc<"records"> & {
  id: Id<"records">;
  type: RecordTypeKey; // adapter normalize eder (legacy lokalize → anahtar)
};

export type Weight = Doc<"weights"> & { id: Id<"weights"> };

// --- Mutation girdileri (form payload'ları) -------------------------------

export type PetInput = {
  name: string;
  type: string;
  breed?: string;
  birthDate?: string;
  photo?: string;
  photoStorageId?: Id<"_storage">;
  notes?: string;
  vets?: Vet[];
};

export type RecordInput = {
  petId: Id<"pets">;
  type: string;
  date: string;
  nextDate?: string;
  notes?: string;
};

export type WeightInput = {
  petId: Id<"pets">;
  weight: string;
  date: string;
  notes?: string;
};

// --- Context value tipleri -------------------------------------------------

export type AuthUser = {
  id: Id<"users">;
  name: string;
  email: string | null;
  isGuest: boolean;
};

export type ActionResult = { success: true } | { success: false; error: string };

export type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  register: (name: string, email: string, password: string) => Promise<ActionResult>;
  login: (email: string, password: string) => Promise<ActionResult>;
  loginAsGuest: () => Promise<ActionResult>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<ActionResult>;
  deleteAccount: () => Promise<ActionResult>;
  upgradeGuest: (name: string, email: string, password: string) => Promise<ActionResult>;
};

export type PetContextValue = {
  pets: Pet[];
  records: PetRecord[];
  weights: Weight[];
  loading: boolean;
  addPet: (pet: PetInput) => Promise<void>;
  updatePet: (
    id: Id<"pets">,
    updatedPet: Partial<PetInput> & { clearPhoto?: boolean }
  ) => Promise<void>;
  deletePet: (id: Id<"pets">) => Promise<void>;
  addRecord: (record: RecordInput) => Promise<void>;
  updateRecord: (
    id: Id<"records">,
    updatedRecord: Partial<Omit<RecordInput, "petId">>
  ) => Promise<void>;
  deleteRecord: (id: Id<"records">) => Promise<void>;
  reorderRecords: (orderedIds: Id<"records">[]) => Promise<void>;
  getRecordsByPet: (petId: Id<"pets">) => PetRecord[];
  addWeight: (weight: WeightInput) => Promise<void>;
  deleteWeight: (id: Id<"weights">) => Promise<void>;
  getWeightsByPet: (petId: Id<"pets">) => Weight[];
  language: string;
  setLanguage: (lang: string) => void;
};
