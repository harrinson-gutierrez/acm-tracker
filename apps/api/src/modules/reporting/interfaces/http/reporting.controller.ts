import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../../../auth/auth.guard";
import { ProjectCostBreakdownUseCase } from "../../application/use-cases/project-cost-breakdown.use-case";
import { CostByPersonUseCase } from "../../application/use-cases/cost-by-person.use-case";
import { WeeklyCostSeriesUseCase } from "../../application/use-cases/weekly-cost-series.use-case";

@UseGuards(AuthGuard)
@Controller()
export class ReportingController {
  constructor(
    private readonly projectBreakdown: ProjectCostBreakdownUseCase,
    private readonly byPerson: CostByPersonUseCase,
    private readonly weekly: WeeklyCostSeriesUseCase,
  ) {}

  @Get("projects/:id/cost") projectCost(@Param("id") id: string) {
    return this.projectBreakdown.execute(id);
  }

  @Get("reports/by-person") costByPerson() {
    return this.byPerson.execute();
  }

  @Get("reports/weekly") weeklyCost(@Query("weeks") weeks?: string) {
    return this.weekly.execute(weeks ? Number(weeks) : 8);
  }
}
