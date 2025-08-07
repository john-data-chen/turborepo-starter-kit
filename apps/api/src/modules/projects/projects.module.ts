import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project, ProjectSchema } from './schemas/projects.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    UsersModule, // Import UsersModule to enable population of owner and members
    forwardRef(() => TasksModule) // Import TasksModule to enable task cleanup on project deletion
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService]
})
export class ProjectsModule {}
