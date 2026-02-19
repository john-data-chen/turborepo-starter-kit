import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { BoardsModule } from "../boards/boards.module";

import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";
import { ProjectRepository } from "./repositories/projects.repository";
import { Project, ProjectSchema } from "./schemas/projects.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    BoardsModule
  ],
  controllers: [ProjectsController],
  providers: [ProjectRepository, ProjectsService],
  exports: [ProjectsService]
})
export class ProjectsModule {}
