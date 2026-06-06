import { Injectable } from "@nestjs/common";
import type { PersonCost, TimeEntry, WeeklyCost } from "@acm/shared";
import { computeEntryCost } from "@acm/shared";
import { PrismaService } from "../../../../prisma/prisma.service";
import { CostAggregationPort, ProjectCostRow } from "../../domain/ports/cost-aggregation.port";

const round2 = (n: number): number => Math.round(n * 100) / 100;

function weekLabel(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 1);
  const diffDays = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  const week = Math.ceil((diffDays + start.getDay() + 1) / 7);
  return `S${week}`;
}

@Injectable()
export class PrismaCostAggregationRepository implements CostAggregationPort {
  constructor(private readonly prisma: PrismaService) {}

  async projectHumanCost(projectId: string): Promise<ProjectCostRow> {
    const rows = await this.prisma.timeEntry.findMany({ where: { task: { projectId } } });
    let human = 0;
    let minutes = 0;
    for (const r of rows) {
      human += computeEntryCost(r as unknown as TimeEntry);
      minutes += r.minutes;
    }
    return { human: round2(human), minutes };
  }

  async costByPerson(): Promise<PersonCost[]> {
    const members = await this.prisma.member.findMany({ orderBy: { createdAt: "asc" } });
    const result: PersonCost[] = [];
    for (const m of members) {
      const rows = await this.prisma.timeEntry.findMany({ where: { memberId: m.id } });
      let human = 0;
      let minutes = 0;
      for (const r of rows) {
        human += computeEntryCost(r as unknown as TimeEntry);
        minutes += r.minutes;
      }
      const total = round2(human);
      result.push({ memberId: m.id, name: m.name, minutes, human: total, ai: 0, total });
    }
    return result;
  }

  async weeklyHumanCost(weeks: number): Promise<WeeklyCost[]> {
    const rows = await this.prisma.timeEntry.findMany({ orderBy: { startedAt: "asc" } });
    const byWeek = new Map<string, number>();
    for (const r of rows) {
      const label = weekLabel(r.startedAt);
      byWeek.set(label, (byWeek.get(label) ?? 0) + computeEntryCost(r as unknown as TimeEntry));
    }
    return [...byWeek.entries()]
      .slice(-weeks)
      .map(([week, human]) => ({ week, human: round2(human), ai: 0 }));
  }
}
