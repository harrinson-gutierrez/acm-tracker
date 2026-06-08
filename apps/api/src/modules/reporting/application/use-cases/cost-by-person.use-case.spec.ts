import { CostByPersonUseCase } from "./cost-by-person.use-case";
import type { PersonCost, WeeklyCost } from "@acm/shared";
import {
  CostAggregationPort,
  ProjectCostRow,
  TeamTodayRow,
  TodaySummary,
} from "../../domain/ports/cost-aggregation.port";

class FakeAgg implements CostAggregationPort {
  public lastProjectId: string | undefined = undefined;
  async projectHumanCost(): Promise<ProjectCostRow> {
    return { human: 0, minutes: 0 };
  }
  async costByPerson(projectId?: string): Promise<PersonCost[]> {
    this.lastProjectId = projectId;
    return [{ memberId: "m1", name: "Ada", minutes: 60, human: 50, ai: 0, total: 50 }];
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

describe("CostByPersonUseCase", () => {
  it("aggregates globally when no projectId is given", async () => {
    const agg = new FakeAgg();
    const useCase = new CostByPersonUseCase(agg);
    const result = await useCase.execute();
    expect(agg.lastProjectId).toBeUndefined();
    expect(result).toEqual([{ memberId: "m1", name: "Ada", minutes: 60, human: 50, ai: 0, total: 50 }]);
  });

  it("scopes aggregation to the given project", async () => {
    const agg = new FakeAgg();
    const useCase = new CostByPersonUseCase(agg);
    await useCase.execute("p1");
    expect(agg.lastProjectId).toBe("p1");
  });
});
