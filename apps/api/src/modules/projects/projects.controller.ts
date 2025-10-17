import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { ProjectsService } from './projects.service'
import { Project } from './schemas/projects.schema'

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({
    status: 201,
    description: 'The project has been successfully created.',
    type: Project
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createProjectDto: CreateProjectDto, @CurrentUser() user: { _id: string; email: string }) {
    const projectData = {
      ...createProjectDto,
      owner: user._id
    }
    return this.projectsService.create(projectData)
  }

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
  async getProjectsByBoard(@Query('boardId') boardId: string, @CurrentUser() _user: { _id: string }) {
    return this.projectsService.findByBoardId(boardId)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully updated.',
    type: Project
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: { _id: string }
  ) {
    try {
      const updatedProject = await this.projectsService.update(id, updateProjectDto, user._id)
      return updatedProject
    } catch (error) {
      console.error('Error in update endpoint:', error)
      throw error // Let the global exception filter handle it
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully deleted.'
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: { _id: string }) {
    try {
      await this.projectsService.remove(id, user._id)
      return { success: true, message: 'Project deleted successfully' }
    } catch (error) {
      console.error('Error in delete endpoint:', error)
      throw error
    }
  }
}
