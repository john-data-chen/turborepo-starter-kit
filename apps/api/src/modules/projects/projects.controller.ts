import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProjectPermissionsDto } from './dto/project-permissions.dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Check user permissions for a project' })
  async getProjectPermissions(
    @Param('id') projectId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<ProjectPermissionsDto> {
    return this.projectsService.checkProjectPermissions(projectId, user.userId);
  }
}
