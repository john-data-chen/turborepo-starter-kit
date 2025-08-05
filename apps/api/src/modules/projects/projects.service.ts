import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectPermissionsDto } from './dto/project-permissions.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
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
    // Input validation
    if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid project or user ID');
    }

    try {
      // Find the project with board and owner information
      const project = await this.projectModel
        .findById(projectId)
        .populate({
          path: 'board',
          select: 'owner',
          populate: {
            path: 'owner',
            select: '_id'
          }
        })
        .lean();

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      // Type assertion for the populated board
      const board = project.board as unknown as { owner: Types.ObjectId };
      if (!board?.owner) {
        throw new NotFoundException('Board owner information not found');
      }

      // Get owner IDs as strings for comparison
      const projectOwnerId = project.owner?.toString();
      const boardOwnerId = board.owner.toString();
      const currentUserId = new Types.ObjectId(userId).toString();

      // Check permissions
      const isProjectOwner = projectOwnerId === currentUserId;
      const isBoardOwner = boardOwnerId === currentUserId;
      const canModify = isProjectOwner || isBoardOwner;

      return {
        canEditProject: canModify,
        canDeleteProject: canModify
      };
    } catch (error) {
      console.error('Error checking project permissions:', error);
      // Default to most restrictive permissions on error
      return {
        canEditProject: false,
        canDeleteProject: false
      };
    }
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string
  ): Promise<ProjectDocument> {
    console.log('Update request received:', { id, updateProjectDto, userId });

    if (!Types.ObjectId.isValid(id)) {
      const error = 'Invalid project ID';
      console.error(error, { id });
      throw new BadRequestException(error);
    }

    if (!Types.ObjectId.isValid(userId)) {
      const error = 'Invalid user ID';
      console.error(error, { userId });
      throw new BadRequestException(error);
    }

    console.log('Finding project with ID:', id);
    const project = await this.projectModel.findById(id);
    if (!project) {
      const error = 'Project not found';
      console.error(error, { id });
      throw new NotFoundException(error);
    }

    console.log('Found project:', project);
    console.log('Checking permissions...');

    // Check if the user has permission to update the project
    const permissions = await this.checkProjectPermissions(id, userId);
    console.log('Permissions:', permissions);

    if (!permissions.canEditProject) {
      const error = 'You do not have permission to update this project';
      console.error(error, { userId, projectId: id });
      throw new BadRequestException(error);
    }

    console.log('Updating project with data:', updateProjectDto);

    // Only update the fields that are provided in the DTO
    if (updateProjectDto.title !== undefined) {
      console.log(
        'Updating title from',
        project.title,
        'to',
        updateProjectDto.title
      );
      project.title = updateProjectDto.title;
    }

    // Handle null/undefined for description
    if ('description' in updateProjectDto) {
      const newDescription = updateProjectDto.description ?? '';
      console.log(
        'Updating description from',
        project.description,
        'to',
        newDescription
      );
      project.description = newDescription;
    }

    try {
      console.log('Saving project...');
      const updatedProject = await project.save();
      console.log('Project saved successfully:', updatedProject);
      return updatedProject;
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    console.log('Delete request received:', { id, userId });

    if (!Types.ObjectId.isValid(id)) {
      const error = 'Invalid project ID';
      console.error(error, { id });
      throw new BadRequestException(error);
    }

    if (!Types.ObjectId.isValid(userId)) {
      const error = 'Invalid user ID';
      console.error(error, { userId });
      throw new BadRequestException(error);
    }

    console.log('Finding project with ID:', id);
    const project = await this.projectModel.findById(id);
    if (!project) {
      const error = 'Project not found';
      console.error(error, { id });
      throw new NotFoundException(error);
    }

    console.log('Checking permissions...');
    const permissions = await this.checkProjectPermissions(id, userId);
    console.log('Permissions:', permissions);

    if (!permissions.canDeleteProject) {
      const error = 'You do not have permission to delete this project';
      console.error(error, { userId, projectId: id });
      throw new BadRequestException(error);
    }

    console.log('Deleting project...');
    const result = await this.projectModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      const error = 'Failed to delete project';
      console.error(error, { id });
      throw new Error(error);
    }

    console.log('Project deleted successfully');
  }

  async create(
    createProjectDto: CreateProjectDto & { owner: string }
  ): Promise<ProjectDocument> {
    try {
      console.log(
        'Raw createProjectDto received in service:',
        JSON.stringify(createProjectDto, null, 2)
      );

      const { title, description, boardId, owner } = createProjectDto;

      console.log('Processed fields in service:', {
        title,
        description,
        boardId,
        owner,
        isBoardIdValid: Types.ObjectId.isValid(boardId),
        isOwnerValid: Types.ObjectId.isValid(owner),
        ownerType: typeof owner
      });

      if (!Types.ObjectId.isValid(boardId)) {
        console.error('Invalid board ID:', boardId);
        throw new BadRequestException(`Invalid board ID: ${boardId}`);
      }

      if (!Types.ObjectId.isValid(owner)) {
        console.error('Invalid owner ID:', owner);
        throw new BadRequestException(`Invalid owner ID: ${owner}`);
      }

      const ownerId = new Types.ObjectId(owner);

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
            owner: owner,
            members: [owner]
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
