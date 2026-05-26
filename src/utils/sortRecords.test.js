import { describe, it, expect } from "vitest";
import { sortRecordsForDisplay } from "./sortRecords";

describe("sortRecordsForDisplay", () => {
  it("manuel sıralama yokken tarihe göre (en yeni önce) sıralar", () => {
    const records = [
      { id: "a", date: "2026-01-01" },
      { id: "b", date: "2026-03-01" },
      { id: "c", date: "2026-02-01" },
    ];
    expect(sortRecordsForDisplay(records).map((r) => r.id)).toEqual(["b", "c", "a"]);
  });

  it("manuel sıralama varsa order alanına göre artan sıralar", () => {
    const records = [
      { id: "a", date: "2026-03-01", order: 2 },
      { id: "b", date: "2026-01-01", order: 0 },
      { id: "c", date: "2026-02-01", order: 1 },
    ];
    expect(sortRecordsForDisplay(records).map((r) => r.id)).toEqual(["b", "c", "a"]);
  });

  it("manuel sıralama aktifken order'sız (yeni) kayıtları sona koyar", () => {
    const records = [
      { id: "yeni", date: "2026-12-01" },
      { id: "a", date: "2026-01-01", order: 0 },
      { id: "b", date: "2026-02-01", order: 1 },
    ];
    expect(sortRecordsForDisplay(records).map((r) => r.id)).toEqual(["a", "b", "yeni"]);
  });

  it("orijinal diziyi değiştirmez", () => {
    const records = [
      { id: "a", date: "2026-01-01" },
      { id: "b", date: "2026-03-01" },
    ];
    const copy = [...records];
    sortRecordsForDisplay(records);
    expect(records).toEqual(copy);
  });
});
