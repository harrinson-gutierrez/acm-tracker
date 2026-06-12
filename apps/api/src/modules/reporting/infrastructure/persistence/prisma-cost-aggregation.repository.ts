import { Injectable } from "@nestjs/common";
import type { PersonCost, TimeEntry, WeeklyCost } from "@acm/shared";
import { computeEntryCost } from "@acm/shared";
import { PrismaService } from "../../../../prisma/prisma.service";
import {
  CostAggregationPort,
  MarginSummary,
  ProjectCostRow,
  ProjectEstimateRow,
  TeamTodayRow,
  TodaySummary,
} from "../../domain/ports/cost-aggregation.port";

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

  async projectEstimate(projectId: string): Promise<ProjectEstimateRow> {
    const row = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { estimateHours: true, ratePerHour: true },
    });
    return { estimateHours: row?.estimateHours ?? null, ratePerHour: row?.ratePerHour ?? null };
  }

  async costByPerson(projectId?: string): Promise<PersonCost[]> {
    const members = await this.prisma.member.findMany({ orderBy: { createdAt: "asc" } });
    const result: PersonCost[] = [];
    for (const m of members) {
      const rows = await this.prisma.timeEntry.findMany({
        where: { memberId: m.id, ...(projectId ? { task: { projectId } } : {}) },
      });
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

  async todaySummary(from: Date, to: Date, weekFrom: Date): Promise<TodaySummary> {
    const rows = await this.prisma.timeEntry.findMany({
      where: { startedAt: { gte: from, lt: to } },
      include: { aiRuns: true },
    });
    let cost = 0;
    let tracked = 0;
    let billable = 0;
    let aiCost = 0;
    for (const r of rows) {
      cost += computeEntryCost(r as unknown as TimeEntry);
      tracked += r.minutes;
      if (r.billable) billable += r.minutes;
      aiCost += r.aiRuns.reduce((s, a) => s + a.costUsd, 0);
    }
    const week = await this.prisma.timeEntry.aggregate({
      _sum: { minutes: true },
      where: { startedAt: { gte: weekFrom, lt: to } },
    });
    return {
      trackedMinutes: tracked,
      billableMinutes: billable,
      cost: round2(cost),
      aiCost: round2(aiCost),
      weekMinutes: week._sum.minutes ?? 0,
    };
  }

  async marginSummary(): Promise<MarginSummary> {
    const projects = await this.prisma.project.findMany({ where: { ratePerHour: { not: null } } });
    let revenue = 0;
    let cost = 0;
    for (const p of projects) {
      const rows = await this.prisma.timeEntry.findMany({ where: { task: { projectId: p.id } } });
      let minutes = 0;
      for (const r of rows) {
        minutes += r.minutes;
        cost += computeEntryCost(r as unknown as TimeEntry);
      }
      revenue += (minutes / 60) * (p.ratePerHour as number);
    }
    return { revenue: round2(revenue), cost: round2(cost), margin: round2(revenue - cost), projectCount: projects.length };
  }

  async teamToday(from: Date, to: Date): Promise<TeamTodayRow[]> {
    const members = await this.prisma.member.findMany({ orderBy: { createdAt: "asc" } });
    const out: TeamTodayRow[] = [];
    for (const m of members) {
      const rows = await this.prisma.timeEntry.findMany({ where: { memberId: m.id, startedAt: { gte: from, lt: to } } });
      let cost = 0;
      let tracked = 0;
      for (const r of rows) {
        cost += computeEntryCost(r as unknown as TimeEntry);
        tracked += r.minutes;
      }
      const initials = m.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
      out.push({ memberId: m.id, name: m.name, initials, trackedMinutes: tracked, cost: round2(cost) });
    }
    return out;
  }
}
