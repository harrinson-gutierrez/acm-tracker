import { Injectable } from "@nestjs/common";
import type { TimeEntry } from "@acm/shared";
import { PrismaService } from "../../../../prisma/prisma.service";
import {
  CreateTimeEntryData,
  TimeEntryRepositoryPort,
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
}
