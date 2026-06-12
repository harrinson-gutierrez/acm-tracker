import { NotFoundException } from "@nestjs/common";
import type { TimeEntry } from "@acm/shared";
import { StopTimerUseCase } from "./stop-timer.use-case";
import { ActiveTimerView, TimerSessionPort } from "../../domain/ports/timer-session.port";
import {
  CreateTimeEntryData,
  ProjectEntryView,
  TimeEntryRepositoryPort,
  TodayEntryView,
} from "../../../time-entries/domain/ports/time-entry.repository.port";
import { MemberRateReaderPort } from "../../../time-entries/domain/ports/member-rate.port";

class FakeSessions implements TimerSessionPort {
  public active: ActiveTimerView | null = null;
  public cleared = false;
  public taskKnown = true;
  async findActive(): Promise<ActiveTimerView | null> { return this.active; }
  async create(_memberId: string, taskId: string): Promise<void> {
    this.active = { taskId, taskCode: "T-1", taskTitle: "t", projectName: "p", ratePerHour: 45, startedAt: new Date().toISOString() };
  }
  async clear(): Promise<void> { this.active = null; this.cleared = true; }
  async taskExists(): Promise<boolean> { return this.taskKnown; }
}

class FakeEntries implements TimeEntryRepositoryPort {
  public lastCreate?: CreateTimeEntryData;
  async create(data: CreateTimeEntryData): Promise<TimeEntry> {
    this.lastCreate = data;
    return {
      id: "e1", origin: data.origin ?? "manual", createdAt: "now",
      taskId: data.taskId, memberId: data.memberId, minutes: data.minutes,
      billable: data.billable, ratePerHourSnapshot: data.ratePerHourSnapshot,
      note: data.note, startedAt: data.startedAt.toISOString(),
    };
  }
  async findByTask(): Promise<TimeEntry[]> { return []; }
  async findByProject(): Promise<ProjectEntryView[]> { return []; }
  async findToday(): Promise<TodayEntryView[]> { return []; }
}

class FakeRates implements MemberRateReaderPort {
  async getRatePerHour(): Promise<number> { return 48.5; }
}

function activeStartedAgo(ms: number): ActiveTimerView {
  return {
    taskId: "t1", taskCode: "T-1", taskTitle: "Task", projectName: "Helios",
    ratePerHour: 45, startedAt: new Date(Date.now() - ms).toISOString(),
  };
}

describe("StopTimerUseCase", () => {
  it("logs a timer entry with elapsed minutes and clears the session", async () => {
    const sessions = new FakeSessions();
    sessions.active = activeStartedAgo(125_000);
    const entries = new FakeEntries();
    const useCase = new StopTimerUseCase(sessions, entries, new FakeRates());
    await useCase.execute("m1");
    expect(entries.lastCreate?.minutes).toBe(2);
    expect(entries.lastCreate?.origin).toBe("timer");
    expect(entries.lastCreate?.ratePerHourSnapshot).toBe(48.5);
    expect(entries.lastCreate?.billable).toBe(true);
    expect(sessions.cleared).toBe(true);
  });

  it("logs at least 1 minute on an immediate stop", async () => {
    const sessions = new FakeSessions();
    sessions.active = activeStartedAgo(2_000);
    const entries = new FakeEntries();
    const useCase = new StopTimerUseCase(sessions, entries, new FakeRates());
    await useCase.execute("m1");
    expect(entries.lastCreate?.minutes).toBe(1);
  });

  it("throws NotFound when no timer is running", async () => {
    const useCase = new StopTimerUseCase(new FakeSessions(), new FakeEntries(), new FakeRates());
    await expect(useCase.execute("m1")).rejects.toThrow(NotFoundException);
  });
});
