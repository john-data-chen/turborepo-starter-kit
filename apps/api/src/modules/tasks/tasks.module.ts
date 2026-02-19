import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ProjectsModule } from "../projects/projects.module";

import { TaskRepository } from "./repositories/tasks.repository";
import { Task, TaskSchema } from "./schemas/tasks.schema";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]), ProjectsModule],
  controllers: [TasksController],
  providers: [TaskRepository, TasksService],
  exports: [TasksService]
})
export class TasksModule {}
