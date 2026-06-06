import { describe, it, expect } from "vitest";
import { computeEntryCost, sumCost } from "./cost";
import type { TimeEntry } from "./types";

const entry = (minutes: number, rate: number, billable = true): TimeEntry => ({
  id: "e", taskId: "t", memberId: "m", origin: "manual",
  minutes, billable, ratePerHourSnapshot: rate, note: null,
  startedAt: "2026-06-05T09:00:00Z", createdAt: "2026-06-05T09:00:00Z",
});

describe("computeEntryCost", () => {
  it("multiplies minutes by hourly rate", () => {
    expect(computeEntryCost(entry(60, 45))).toBe(45);
    expect(computeEntryCost(entry(30, 48.5))).toBe(24.25);
  });
  it("rounds to 2 decimals", () => {
    expect(computeEntryCost(entry(45, 32))).toBe(24);
    expect(computeEntryCost(entry(7, 45))).toBe(5.25);
  });
});

describe("sumCost", () => {
  it("sums billable and non-billable separately", () => {
    const r = sumCost([entry(60, 45), entry(30, 45, false)]);
    expect(r.total).toBe(67.5);
    expect(r.billable).toBe(45);
  });
  it("returns zeros for empty input", () => {
    expect(sumCost([])).toEqual({ total: 0, billable: 0, minutes: 0 });
  });
});
