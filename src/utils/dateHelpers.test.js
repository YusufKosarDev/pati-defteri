import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getDaysUntil,
  isOverdue,
  isUpcoming,
  calculateAge,
  getBirthdayStatus,
  getAvatarColor,
  getAvatarGradient,
} from "./dateHelpers";

function isoOffsetDays(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

describe("getDaysUntil", () => {
  it("returns null for falsy input", () => {
    expect(getDaysUntil("")).toBe(null);
    expect(getDaysUntil(null)).toBe(null);
    expect(getDaysUntil(undefined)).toBe(null);
  });

  it("returns positive number for future dates", () => {
    expect(getDaysUntil(isoOffsetDays(5))).toBeGreaterThanOrEqual(4);
    expect(getDaysUntil(isoOffsetDays(5))).toBeLessThanOrEqual(5);
  });

  it("returns negative number for past dates", () => {
    expect(getDaysUntil(isoOffsetDays(-3))).toBeLessThan(0);
  });
});

describe("isOverdue", () => {
  it("treats past dates as overdue", () => {
    expect(isOverdue(isoOffsetDays(-1))).toBe(true);
  });
  it("treats future dates as not overdue", () => {
    expect(isOverdue(isoOffsetDays(7))).toBe(false);
  });
});

describe("isUpcoming", () => {
  it("flags dates within default 30 day window", () => {
    expect(isUpcoming(isoOffsetDays(5))).toBe(true);
  });
  it("excludes dates past the window", () => {
    expect(isUpcoming(isoOffsetDays(40))).toBe(false);
  });
  it("excludes already overdue dates", () => {
    expect(isUpcoming(isoOffsetDays(-1))).toBe(false);
  });
  it("respects custom window", () => {
    expect(isUpcoming(isoOffsetDays(10), 7)).toBe(false);
    expect(isUpcoming(isoOffsetDays(5), 7)).toBe(true);
  });
});

describe("calculateAge", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null for falsy input", () => {
    expect(calculateAge(null)).toBe(null);
    expect(calculateAge("")).toBe(null);
  });

  it("formats young pets in months (TR)", () => {
    expect(calculateAge("2026-02-15")).toMatch(/aylık|month/);
  });

  it("formats pets aged exactly in years (TR)", () => {
    expect(calculateAge("2023-06-15")).toMatch(/3 yaşında|3 year/);
  });

  it("formats pets with years + months", () => {
    expect(calculateAge("2023-02-15")).toMatch(/3 yaş 4 ay|3 yr 4 mo/);
  });
});

describe("getBirthdayStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null for falsy input", () => {
    expect(getBirthdayStatus(null)).toBe(null);
  });

  it("flags birthday today", () => {
    const status = getBirthdayStatus("2023-06-15");
    expect(status?.type).toBe("today");
    expect(status?.daysUntil).toBe(0);
    expect(status?.age).toBe(3);
  });

  it("flags upcoming birthday within 7 days", () => {
    const status = getBirthdayStatus("2023-06-20");
    expect(status?.type).toBe("upcoming");
    expect(status?.daysUntil).toBeGreaterThan(0);
    expect(status?.daysUntil).toBeLessThanOrEqual(7);
  });

  it("returns null when birthday already passed and next year is far", () => {
    expect(getBirthdayStatus("2023-01-10")).toBe(null);
  });
});

describe("avatar helpers", () => {
  it("returns deterministic color for the same name", () => {
    expect(getAvatarColor("Pamuk")).toBe(getAvatarColor("Pamuk"));
  });
  it("returns deterministic gradient for the same name", () => {
    expect(getAvatarGradient("Karamel")).toBe(getAvatarGradient("Karamel"));
  });
  it("uses fallback for falsy name", () => {
    expect(getAvatarColor("")).toBeTruthy();
    expect(getAvatarGradient("")).toBeTruthy();
  });
});
