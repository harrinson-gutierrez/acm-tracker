import type { TimeEntry } from "@acm/shared";

export const TIME_ENTRY_REPOSITORY = Symbol("TIME_ENTRY_REPOSITORY");

export interface CreateTimeEntryData {
  taskId: string;
  memberId: string;
  minutes: number;
  billable: boolean;
  ratePerHourSnapshot: number;
  note: string | null;
  startedAt: Date;
}

export interface TodayEntryView {
  id: string;
  time: string;
  origin: string;
  taskCode: string;
  taskTitle: string;
  minutes: number;
  cost: number;
}

export interface TimeEntryRepositoryPort {
  create(data: CreateTimeEntryData): Promise<TimeEntry>;
  findByTask(taskId: string): Promise<TimeEntry[]>;
  findToday(from: Date, to: Date): Promise<TodayEntryView[]>;
}
