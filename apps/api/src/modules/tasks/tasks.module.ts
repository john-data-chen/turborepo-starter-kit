import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { Task, TaskSchema } from './schemas/tasks.schema';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }])
  ],
  controllers: [TasksController],
  providers: [TasksService, ParseObjectIdPipe],
  exports: [TasksService]
})
export class TasksModule {}
