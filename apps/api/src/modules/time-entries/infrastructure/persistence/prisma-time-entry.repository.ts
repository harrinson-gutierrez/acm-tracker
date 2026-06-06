import { Injectable } from "@nestjs/common";
import type { TimeEntry } from "@acm/shared";
import { computeEntryCost } from "@acm/shared";
import { PrismaService } from "../../../../prisma/prisma.service";
import {
  CreateTimeEntryData,
  TimeEntryRepositoryPort,
  TodayEntryView,
} from "../../domain/ports/time-entry.repository.port";
import { toDomainTimeEntry } from "./time-entry.mapper";

@Injectable()
export class PrismaTimeEntryRepository implements TimeEntryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTimeEntryData): Promise<TimeEntry> {
    const row = await this.prisma.timeEntry.create({ data: { ...data, origin: "manual" } });
    return toDomainTimeEntry(row);
  }

  async findByTask(taskId: string): Promise<TimeEntry[]> {
    const rows = await this.prisma.timeEntry.findMany({
      where: { taskId },
      orderBy: { startedAt: "desc" },
    });
    return rows.map(toDomainTimeEntry);
  }

  async findToday(from: Date, to: Date): Promise<TodayEntryView[]> {
    const rows = await this.prisma.timeEntry.findMany({
      where: { startedAt: { gte: from, lt: to } },
      orderBy: { startedAt: "desc" },
      include: { task: true },
    });
    return rows.map((r) => ({
      id: r.id,
      time: r.startedAt.toISOString().slice(11, 16),
      origin: r.origin,
      taskCode: r.task.code,
      taskTitle: r.task.title,
      minutes: r.minutes,
      cost: computeEntryCost(r as unknown as TimeEntry),
    }));
  }
}
