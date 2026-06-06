import { Inject, Injectable } from "@nestjs/common";
import { breakdownCost } from "@acm/shared";
import { COST_AGGREGATION, CostAggregationPort } from "../../domain/ports/cost-aggregation.port";

export interface ProjectCostBreakdown {
  human: number;
  ai: number;
  total: number;
  minutes: number;
}

@Injectable()
export class ProjectCostBreakdownUseCase {
  constructor(@Inject(COST_AGGREGATION) private readonly agg: CostAggregationPort) {}

  async execute(projectId: string): Promise<ProjectCostBreakdown> {
    const row = await this.agg.projectHumanCost(projectId);
    const breakdown = breakdownCost(row.human, 0);
    return { ...breakdown, minutes: row.minutes };
  }
}
