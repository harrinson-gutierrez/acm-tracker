import { Module } from "@nestjs/common";
import { COST_AGGREGATION } from "./domain/ports/cost-aggregation.port";
import { ProjectCostBreakdownUseCase } from "./application/use-cases/project-cost-breakdown.use-case";
import { CostByPersonUseCase } from "./application/use-cases/cost-by-person.use-case";
import { WeeklyCostSeriesUseCase } from "./application/use-cases/weekly-cost-series.use-case";
import { PrismaCostAggregationRepository } from "./infrastructure/persistence/prisma-cost-aggregation.repository";
import { ReportingController } from "./interfaces/http/reporting.controller";

@Module({
  controllers: [ReportingController],
  providers: [
    ProjectCostBreakdownUseCase,
    CostByPersonUseCase,
    WeeklyCostSeriesUseCase,
    { provide: COST_AGGREGATION, useClass: PrismaCostAggregationRepository },
  ],
})
export class ReportingModule {}
