import { describe, it, expect } from "vitest";
import { normalizePetType, petTypeLabel } from "./petType";
import { normalizeRecordType, recordTypeLabel } from "./recordTypes";

describe("normalizePetType — geriye dönük uyumluluk", () => {
  it("yeni anahtarları olduğu gibi döner", () => {
    expect(normalizePetType("cat")).toBe("cat");
    expect(normalizePetType("dog")).toBe("dog");
    expect(normalizePetType("other")).toBe("other");
  });

  it("legacy TR/EN lokalize değerleri anahtara indirger", () => {
    expect(normalizePetType("Kedi")).toBe("cat");
    expect(normalizePetType("Cat")).toBe("cat");
    expect(normalizePetType("Köpek")).toBe("dog");
    expect(normalizePetType("Dog")).toBe("dog");
    expect(normalizePetType("Diğer")).toBe("other");
    expect(normalizePetType("Other")).toBe("other");
  });

  it("bilinmeyen/boş değer için 'other' döner", () => {
    expect(normalizePetType(undefined)).toBe("other");
    expect(normalizePetType("")).toBe("other");
    expect(normalizePetType("xyz")).toBe("other");
  });

  it("etiket dilden bağımsız anahtardan çevrilir", () => {
    expect(petTypeLabel("cat", false)).toBe("Kedi");
    expect(petTypeLabel("cat", true)).toBe("Cat");
    expect(petTypeLabel("dog", false)).toBe("Köpek");
    expect(petTypeLabel("dog", true)).toBe("Dog");
  });
});

describe("normalizeRecordType — geriye dönük uyumluluk", () => {
  it("yeni anahtarları olduğu gibi döner", () => {
    expect(normalizeRecordType("mixed_vaccine")).toBe("mixed_vaccine");
    expect(normalizeRecordType("rabies")).toBe("rabies");
    expect(normalizeRecordType("other")).toBe("other");
  });

  it("legacy TR/EN lokalize değerleri anahtara indirger", () => {
    expect(normalizeRecordType("Karma Aşı")).toBe("mixed_vaccine");
    expect(normalizeRecordType("Mixed Vaccine")).toBe("mixed_vaccine");
    expect(normalizeRecordType("Kuduz Aşısı")).toBe("rabies");
    expect(normalizeRecordType("Rabies Vaccine")).toBe("rabies");
    expect(normalizeRecordType("Parazit Damlası")).toBe("parasite_drop");
    expect(normalizeRecordType("Veteriner Ziyareti")).toBe("vet_visit");
    expect(normalizeRecordType("Diğer")).toBe("other");
  });

  it("bilinmeyen değer için 'other' döner", () => {
    expect(normalizeRecordType(undefined)).toBe("other");
    expect(normalizeRecordType("Random")).toBe("other");
  });

  it("etiket anahtardan çevrilir", () => {
    expect(recordTypeLabel("mixed_vaccine", false)).toBe("Karma Aşı");
    expect(recordTypeLabel("mixed_vaccine", true)).toBe("Mixed Vaccine");
    expect(recordTypeLabel("vet_visit", false)).toBe("Veteriner Ziyareti");
  });
});
