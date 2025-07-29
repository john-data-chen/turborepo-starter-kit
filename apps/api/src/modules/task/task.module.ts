import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Task, TaskSchema } from "./schemas/task.schema";
import { TaskService } from "./services/task.service";
import { BoardModule } from "../board/board.module";
import { ProjectModule } from "../project/project.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    BoardModule,
    ProjectModule,
    UserModule,
  ],
  providers: [TaskService],
  exports: [MongooseModule, TaskService],
})
export class TaskModule {}
