import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskPermissionsDto } from './dto/task-permissions.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from './schemas/tasks.schema';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: TaskResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req
  ): Promise<TaskResponseDto> {
    return this.tasksService.create(createTaskDto, req.user.userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tasks (optionally filtered by project or assignee)'
  })
  @ApiResponse({
    status: 200,
    description: 'List of tasks',
    type: [TaskResponseDto]
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Query('projectId') projectId?: string,
    @Query('assigneeId') assigneeId?: string
  ): Promise<TaskResponseDto[]> {
    return this.tasksService.findAll(projectId, assigneeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiResponse({
    status: 200,
    description: 'Task found',
    type: TaskResponseDto
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<TaskResponseDto> {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({
    status: 200,
    description: 'Task updated',
    type: TaskResponseDto
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req
  ): Promise<TaskResponseDto> {
    return this.tasksService.update(id, updateTaskDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.tasksService.remove(id);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Check user permissions for a task' })
  @ApiResponse({
    status: 200,
    description: 'Task permissions retrieved successfully',
    type: TaskPermissionsDto
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTaskPermissions(
    @Param('id', ParseObjectIdPipe) id: string,
    @Req() req
  ): Promise<TaskPermissionsDto> {
    return this.tasksService.checkTaskPermissions(id, req.user.userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  @ApiResponse({
    status: 200,
    description: 'Task status updated',
    type: TaskResponseDto
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body('status') status: TaskStatus,
    @Req() req
  ): Promise<TaskResponseDto> {
    return this.tasksService.updateStatus(id, status, req.user.userId);
  }
}
