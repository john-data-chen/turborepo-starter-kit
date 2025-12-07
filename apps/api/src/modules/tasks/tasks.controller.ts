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
  UnauthorizedException,
  UseGuards
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateTaskDto } from './dto/create-task.dto'
import { TaskResponseDto } from './dto/task-response.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { TasksService } from './tasks.service'

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
    @Req() req: { user: { _id: string } }
  ): Promise<TaskResponseDto> {
    if (!req.user?._id) {
      throw new UnauthorizedException('User not authenticated')
    }
    return this.tasksService.create(createTaskDto, req.user._id)
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
    return this.tasksService.findAll(projectId, assigneeId)
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
    return this.tasksService.findOne(id)
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
    return this.tasksService.update(id, updateTaskDto, req.user._id)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only the task creator can delete the task'
  })
  remove(@Param('id', ParseObjectIdPipe) id: string, @Req() req): Promise<void> {
    return this.tasksService.remove(id, req.user._id)
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move task to a different project' })
  @ApiResponse({
    status: 200,
    description: 'Task moved successfully',
    type: TaskResponseDto
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  moveTask(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() moveData: { projectId: string; orderInProject: number },
    @Req() req
  ): Promise<TaskResponseDto> {
    if (!req.user || !req.user._id) {
      throw new UnauthorizedException('User not authenticated')
    }
    return this.tasksService.moveTask(id, moveData.projectId, moveData.orderInProject, req.user._id)
  }
}
