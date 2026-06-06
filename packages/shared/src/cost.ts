import type { TimeEntry } from "./types";

const round2 = (n: number): number => Math.round(n * 100) / 100;

export function computeEntryCost(entry: TimeEntry): number {
  return round2((entry.minutes / 60) * entry.ratePerHourSnapshot);
}

export interface CostSummary {
  total: number;
  billable: number;
  minutes: number;
}

export function sumCost(entries: TimeEntry[]): CostSummary {
  const acc = entries.reduce(
    (a, e) => {
      const cost = computeEntryCost(e);
      a.total += cost;
      if (e.billable) a.billable += cost;
      a.minutes += e.minutes;
      return a;
    },
    { total: 0, billable: 0, minutes: 0 },
  );
  return { total: round2(acc.total), billable: round2(acc.billable), minutes: acc.minutes };
}
