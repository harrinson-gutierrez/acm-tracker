import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { MembersModule } from "./modules/members/members.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { TimeEntriesModule } from "./modules/time-entries/time-entries.module";

@Module({
  imports: [PrismaModule, AuthModule, MembersModule, ProjectsModule, TasksModule, TimeEntriesModule],
})
export class AppModule {}
