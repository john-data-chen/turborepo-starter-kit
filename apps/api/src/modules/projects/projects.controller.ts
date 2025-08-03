import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectPermissionsDto } from './dto/project-permissions.dto';
import { ProjectsService } from './projects.service';
import { Project } from './schemas/projects.schema';

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects for a board' })
  @ApiQuery({ name: 'boardId', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of projects',
    type: [Project]
  })
  @ApiResponse({ status: 400, description: 'Invalid board ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProjectsByBoard(
    @Query('boardId') boardId: string,
    @CurrentUser() _user: { userId: string }
  ) {
    return this.projectsService.findByBoardId(boardId);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Check user permissions for a project' })
  async getProjectPermissions(
    @Param('id') projectId: string,
    @CurrentUser() user: { userId: string }
  ): Promise<ProjectPermissionsDto> {
    return this.projectsService.checkProjectPermissions(projectId, user.userId);
  }
}
