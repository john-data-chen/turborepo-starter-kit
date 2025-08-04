import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectPermissionsDto } from './dto/project-permissions.dto';
import { Project, ProjectDocument } from './schemas/projects.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>
  ) {}

  async findByBoardId(boardId: string): Promise<ProjectDocument[]> {
    if (!Types.ObjectId.isValid(boardId)) {
      throw new NotFoundException('Invalid board ID');
    }

    const projects = await this.projectModel
      .find({ board: new Types.ObjectId(boardId) })
      .populate('board', 'title')
      .lean();

    if (!projects || projects.length === 0) {
      return [];
    }

    return projects as ProjectDocument[];
  }

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

  async create(
    createProjectDto: CreateProjectDto & { creatorId: string }
  ): Promise<ProjectDocument> {
    const { title, description, boardId, creatorId } = createProjectDto;

    if (!Types.ObjectId.isValid(boardId)) {
      throw new BadRequestException('Invalid board ID');
    }

    const createdProject = new this.projectModel({
      title,
      description,
      board: new Types.ObjectId(boardId),
      owner: new Types.ObjectId(creatorId)
    });

    return createdProject.save();
  }
}
