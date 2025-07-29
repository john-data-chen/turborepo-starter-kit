import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Project, ProjectSchema } from "./schemas/project.schema";
import { ProjectService } from "./services/project.service";
import { BoardModule } from "../board/board.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    BoardModule,
    UserModule,
  ],
  providers: [ProjectService],
  exports: [MongooseModule, ProjectService],
})
export class ProjectModule {}
