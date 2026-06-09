import type { PersonCost, WeeklyCost } from "@acm/shared";

export const COST_AGGREGATION = Symbol("COST_AGGREGATION");

export interface ProjectCostRow {
  human: number;
  minutes: number;
}

export interface TodaySummary {
  trackedMinutes: number;
  billableMinutes: number;
  cost: number;
}

export interface TeamTodayRow {
  memberId: string;
  name: string;
  initials: string;
  trackedMinutes: number;
  cost: number;
}

export interface CostAggregationPort {
  projectHumanCost(projectId: string): Promise<ProjectCostRow>;
  costByPerson(projectId?: string): Promise<PersonCost[]>;
  weeklyHumanCost(weeks: number): Promise<WeeklyCost[]>;
  todaySummary(from: Date, to: Date): Promise<TodaySummary>;
  teamToday(from: Date, to: Date): Promise<TeamTodayRow[]>;
}
