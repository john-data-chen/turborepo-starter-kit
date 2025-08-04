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
      .populate('owner', 'name email') // Populate owner with name and email
      .populate('members', 'name email') // Populate members with name and email
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
    try {
      const { title, description, boardId, creatorId } = createProjectDto;

      console.log('Received create project request with data:', {
        title,
        description,
        boardId,
        creatorId,
        isBoardIdValid: Types.ObjectId.isValid(boardId),
        isCreatorIdValid: Types.ObjectId.isValid(creatorId)
      });

      if (!Types.ObjectId.isValid(boardId)) {
        console.error('Invalid board ID:', boardId);
        throw new BadRequestException(`Invalid board ID: ${boardId}`);
      }

      if (!Types.ObjectId.isValid(creatorId)) {
        console.error('Invalid creator ID:', creatorId);
        throw new BadRequestException(`Invalid creator ID: ${creatorId}`);
      }

      const ownerId = new Types.ObjectId(creatorId);

      // Create the project with only the fields defined in the schema
      const project = new this.projectModel({
        title,
        description: description || '',
        board: new Types.ObjectId(boardId),
        owner: ownerId,
        members: [ownerId] // Add the creator as a member
      });

      console.log(
        'Saving project with data:',
        JSON.stringify(
          {
            title,
            description: description || '',
            board: boardId,
            owner: creatorId,
            members: [creatorId]
          },
          null,
          2
        )
      );

      const savedProject = await project.save();

      // Populate the owner and members before returning
      const populatedProject = await this.projectModel
        .findById(savedProject._id)
        .populate('owner', 'name email')
        .populate('members', 'name email')
        .lean();

      console.log(
        'Successfully created and populated project:',
        JSON.stringify(
          {
            _id: populatedProject._id,
            title: populatedProject.title,
            owner: populatedProject.owner,
            members: populatedProject.members,
            board: populatedProject.board
          },
          null,
          2
        )
      );

      return populatedProject as ProjectDocument;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error; // Re-throw the error to be handled by the controller
    }
  }
}
