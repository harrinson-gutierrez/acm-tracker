import { Module } from "@nestjs/common";
import { MCP_INGEST } from "./domain/ports/mcp-ingest.port";
import { ReportWorkUseCase } from "./application/use-cases/report-work.use-case";
import { RecentReportsUseCase } from "./application/use-cases/recent-reports.use-case";
import { PrismaMcpIngestAdapter } from "./infrastructure/persistence/prisma-mcp-ingest.adapter";
import { McpController } from "./interfaces/http/mcp.controller";

@Module({
  controllers: [McpController],
  providers: [
    ReportWorkUseCase,
    RecentReportsUseCase,
    { provide: MCP_INGEST, useClass: PrismaMcpIngestAdapter },
  ],
})
export class McpModule {}
