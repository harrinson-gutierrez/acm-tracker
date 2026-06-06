import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { MembersModule } from "./modules/members/members.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { TimeEntriesModule } from "./modules/time-entries/time-entries.module";
import { ModelPricingModule } from "./modules/model-pricing/model-pricing.module";
import { ReportingModule } from "./modules/reporting/reporting.module";
import { DocumentsModule } from "./modules/documents/documents.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MembersModule,
    ProjectsModule,
    TasksModule,
    TimeEntriesModule,
    ModelPricingModule,
    ReportingModule,
    DocumentsModule,
  ],
})
export class AppModule {}
