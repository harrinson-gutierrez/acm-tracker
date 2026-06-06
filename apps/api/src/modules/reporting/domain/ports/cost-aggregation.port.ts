import type { PersonCost, WeeklyCost } from "@acm/shared";

export const COST_AGGREGATION = Symbol("COST_AGGREGATION");

export interface ProjectCostRow {
  human: number;
  minutes: number;
}

export interface CostAggregationPort {
  projectHumanCost(projectId: string): Promise<ProjectCostRow>;
  costByPerson(): Promise<PersonCost[]>;
  weeklyHumanCost(weeks: number): Promise<WeeklyCost[]>;
}
