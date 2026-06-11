import { TodaySummaryUseCase } from "./today-summary.use-case";
import type { PersonCost, WeeklyCost } from "@acm/shared";
import {
  CostAggregationPort,
  ProjectCostRow,
  ProjectEstimateRow,
  TeamTodayRow,
  TodaySummary,
} from "../../domain/ports/cost-aggregation.port";

class FakeAgg implements CostAggregationPort {
  async projectHumanCost(): Promise<ProjectCostRow> {
    return { human: 0, minutes: 0 };
  }
  async projectEstimate(): Promise<ProjectEstimateRow> {
    return { estimateHours: null, ratePerHour: null };
  }
  async costByPerson(): Promise<PersonCost[]> {
    return [];
  }
  async weeklyHumanCost(): Promise<WeeklyCost[]> {
    return [];
  }
  async todaySummary(): Promise<TodaySummary> {
    return { trackedMinutes: 252, billableMinutes: 240, cost: 334 };
  }
  async teamToday(): Promise<TeamTodayRow[]> {
    return [];
  }
}

describe("TodaySummaryUseCase", () => {
  it("returns the summary from the aggregation port", async () => {
    const useCase = new TodaySummaryUseCase(new FakeAgg());
    const r = await useCase.execute(new Date("2026-06-06T00:00:00Z"), new Date("2026-06-07T00:00:00Z"));
    expect(r).toEqual({ trackedMinutes: 252, billableMinutes: 240, cost: 334 });
  });
});
