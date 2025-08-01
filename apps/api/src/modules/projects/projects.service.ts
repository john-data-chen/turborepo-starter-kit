import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ProjectPermissionsDto } from './dto/project-permissions.dto';
import { Project, ProjectDocument } from './schemas/projects.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>
  ) {}

  async checkProjectPermissions(
    projectId: string,
    userId: string
  ): Promise<ProjectPermissionsDto> {
    const project = (await this.projectModel
      .findById(projectId)
      .populate<{ board: { owner: Types.ObjectId } }>('board', 'owner')
      .lean()) as unknown as ProjectDocument & {
      board: { owner: Types.ObjectId };
    };

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const projectOwnerId = project.owner.toString();
    const boardOwnerId = project.board.owner.toString();
    const currentUserId = userId.toString();

    const isProjectOwner = projectOwnerId === currentUserId;
    const isBoardOwner = boardOwnerId === currentUserId;
    const canModify = isProjectOwner || isBoardOwner;

    return {
      canEditProject: canModify,
      canDeleteProject: canModify
    };
  }
}
