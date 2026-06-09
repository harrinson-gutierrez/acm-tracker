import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../../../auth/auth.guard";
import { ProjectCostBreakdownUseCase } from "../../application/use-cases/project-cost-breakdown.use-case";
import { CostByPersonUseCase } from "../../application/use-cases/cost-by-person.use-case";
import { WeeklyCostSeriesUseCase } from "../../application/use-cases/weekly-cost-series.use-case";
import { TodaySummaryUseCase } from "../../application/use-cases/today-summary.use-case";
import { TeamTodayUseCase } from "../../application/use-cases/team-today.use-case";

function dayBounds(): { from: Date; to: Date } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const to = new Date(from.getTime() + 86_400_000);
  return { from, to };
}

@UseGuards(AuthGuard)
@Controller()
export class ReportingController {
  constructor(
    private readonly projectBreakdown: ProjectCostBreakdownUseCase,
    private readonly byPerson: CostByPersonUseCase,
    private readonly weekly: WeeklyCostSeriesUseCase,
    private readonly todaySummary: TodaySummaryUseCase,
    private readonly teamToday: TeamTodayUseCase,
  ) {}

  @Get("projects/:id/cost") projectCost(@Param("id") id: string) {
    return this.projectBreakdown.execute(id);
  }

  @Get("reports/by-person") costByPerson(@Query("projectId") projectId?: string) {
    return this.byPerson.execute(projectId);
  }

  @Get("reports/weekly") weeklyCost(@Query("weeks") weeks?: string) {
    return this.weekly.execute(weeks ? Number(weeks) : 8);
  }

  @Get("reports/today") today() {
    const { from, to } = dayBounds();
    return this.todaySummary.execute(from, to);
  }

  @Get("reports/team-today") teamTodayRoute() {
    const { from, to } = dayBounds();
    return this.teamToday.execute(from, to);
  }
}
