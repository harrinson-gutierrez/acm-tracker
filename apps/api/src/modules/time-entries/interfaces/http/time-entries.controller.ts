import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../../../auth/auth.guard";
import { CurrentUser } from "../../../../auth/current-user.decorator";
import type { AuthedUser } from "../../../../auth/auth-provider.interface";
import { CreateManualEntryUseCase } from "../../application/use-cases/create-manual-entry.use-case";
import { ListTaskEntriesUseCase } from "../../application/use-cases/list-task-entries.use-case";
import { TaskCostUseCase } from "../../application/use-cases/task-cost.use-case";
import { CreateTimeEntryDto } from "./dto/create-time-entry.dto";

@UseGuards(AuthGuard)
@Controller("time-entries")
export class TimeEntriesController {
  constructor(
    private readonly createManual: CreateManualEntryUseCase,
    private readonly listForTask: ListTaskEntriesUseCase,
    private readonly taskCost: TaskCostUseCase,
  ) {}

  @Post() create(@CurrentUser() user: AuthedUser, @Body() dto: CreateTimeEntryDto) {
    return this.createManual.execute(user.memberId, dto);
  }

  @Get("task/:taskId") forTask(@Param("taskId") taskId: string) {
    return this.listForTask.execute(taskId);
  }

  @Get("task/:taskId/cost") cost(@Param("taskId") taskId: string) {
    return this.taskCost.execute(taskId);
  }
}
