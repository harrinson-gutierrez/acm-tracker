import { ProjectCostBreakdownUseCase } from "./project-cost-breakdown.use-case";
import type { PersonCost, WeeklyCost } from "@acm/shared";
import {
  CostAggregationPort,
  ProjectCostRow,
  TeamTodayRow,
  TodaySummary,
} from "../../domain/ports/cost-aggregation.port";

class FakeAgg implements CostAggregationPort {
  constructor(private readonly row: ProjectCostRow) {}
  async projectHumanCost(): Promise<ProjectCostRow> {
    return this.row;
  }
  async costByPerson(): Promise<PersonCost[]> {
    return [];
  }
  async weeklyHumanCost(): Promise<WeeklyCost[]> {
    return [];
  }
  async todaySummary(): Promise<TodaySummary> {
    return { trackedMinutes: 0, billableMinutes: 0, cost: 0 };
  }
  async teamToday(): Promise<TeamTodayRow[]> {
    return [];
  }
}

describe("ProjectCostBreakdownUseCase", () => {
  it("returns a breakdown with ai fixed at 0 and total = human", async () => {
    const useCase = new ProjectCostBreakdownUseCase(new FakeAgg({ human: 1508, minutes: 2010 }));
    const result = await useCase.execute("p1");
    expect(result).toEqual({ human: 1508, ai: 0, total: 1508, minutes: 2010 });
  });
});
