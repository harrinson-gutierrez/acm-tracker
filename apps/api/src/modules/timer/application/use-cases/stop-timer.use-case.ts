import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { TimeEntry } from "@acm/shared";
import { TIMER_SESSION, TimerSessionPort } from "../../domain/ports/timer-session.port";
import {
  TIME_ENTRY_REPOSITORY,
  TimeEntryRepositoryPort,
} from "../../../time-entries/domain/ports/time-entry.repository.port";
import {
  MEMBER_RATE_READER,
  MemberRateReaderPort,
} from "../../../time-entries/domain/ports/member-rate.port";

@Injectable()
export class StopTimerUseCase {
  constructor(
    @Inject(TIMER_SESSION) private readonly sessions: TimerSessionPort,
    @Inject(TIME_ENTRY_REPOSITORY) private readonly entries: TimeEntryRepositoryPort,
    @Inject(MEMBER_RATE_READER) private readonly rates: MemberRateReaderPort,
  ) {}

  async execute(memberId: string): Promise<TimeEntry> {
    const active = await this.sessions.findActive(memberId);
    if (!active) throw new NotFoundException("No active timer");
    const startedAt = new Date(active.startedAt);
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.getTime()) / 60_000));
    const ratePerHourSnapshot = await this.rates.getRatePerHour(memberId);
    const entry = await this.entries.create({
      taskId: active.taskId,
      memberId,
      origin: "timer",
      minutes,
      billable: true,
      ratePerHourSnapshot,
      note: null,
      startedAt,
    });
    await this.sessions.clear(memberId);
    return entry;
  }
}
