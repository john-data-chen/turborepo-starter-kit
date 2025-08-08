import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateTaskDto } from './dto/create-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument, TaskStatus } from './schemas/tasks.schema';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  /**
   * Delete all tasks associated with a project
   * @param projectId The ID of the project whose tasks should be deleted
   * @returns Promise with the deletion result
   */
  async deleteTasksByProjectId(
    projectId: string
  ): Promise<{ deletedCount: number }> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new Error('Invalid project ID');
    }

    const result = await this.taskModel
      .deleteMany({
        project: new Types.ObjectId(projectId)
      })
      .exec();

    console.log(
      `Deleted ${result.deletedCount} tasks for project ${projectId}`
    );
    return { deletedCount: result.deletedCount || 0 };
  }

  private toUserResponse(user: any) {
    if (!user) {
      console.log('User is null or undefined');
      return null;
    }
    return {
      _id: user._id?.toString() || '',
      name: user.name,
      email: user.email
    };
  }

  private async toTaskResponse(task: TaskDocument): Promise<TaskResponseDto> {
    console.log('=== toTaskResponse called ===');
    console.log('Raw task input:', JSON.stringify(task, null, 2));

    try {
      // First populate the user fields with detailed error handling
      let populatedTask;
      try {
        populatedTask = await task.populate([
          { path: 'creator', select: 'name email' },
          { path: 'assignee', select: 'name email' },
          { path: 'lastModifier', select: 'name email' }
        ]);
        console.log(
          'After population:',
          JSON.stringify(populatedTask, null, 2)
        );
      } catch (populateError) {
        console.error('Error during population:', populateError);
        // If population fails, use the original task
        populatedTask = task;
      }

      // Build the response object
      const response: any = {
        _id: populatedTask._id.toString(),
        title: populatedTask.title,
        status: populatedTask.status,
        board: populatedTask.board?.toString(),
        project: populatedTask.project?.toString(),
        createdAt: populatedTask.createdAt,
        updatedAt: populatedTask.updatedAt
      };

      // Handle user references with fallbacks
      response.creator = this.toUserResponse(populatedTask.creator);
      response.assignee = this.toUserResponse(populatedTask.assignee);

      // Special handling for lastModifier
      if (populatedTask.lastModifier) {
        response.lastModifier = this.toUserResponse(populatedTask.lastModifier);
      } else if (task.lastModifier) {
        // If population failed but we have the ID, create a minimal user object
        console.log(
          'Using fallback for lastModifier with ID:',
          task.lastModifier
        );
        response.lastModifier = {
          _id: task.lastModifier.toString(),
          name: 'Unknown',
          email: 'unknown@example.com'
        };
      } else {
        // If no lastModifier at all, use creator as fallback
        console.log('No lastModifier found, falling back to creator');
        response.lastModifier = response.creator;
      }

      // Handle optional fields
      if (populatedTask.description) {
        response.description = populatedTask.description;
      }

      if (populatedTask.dueDate) {
        response.dueDate = populatedTask.dueDate;
      }

      return response as TaskResponseDto;
    } catch (error) {
      console.error('Error in toTaskResponse:', error);
      throw error;
    }
  }

  async create(
    createTaskDto: CreateTaskDto,
    _userId: string // Keep for backward compatibility but mark as unused
  ): Promise<TaskResponseDto> {
    try {
      // Convert string IDs to ObjectIds
      const creatorId = new Types.ObjectId(createTaskDto.creator);
      const projectId = new Types.ObjectId(createTaskDto.project);

      // Always respect the orderInProject from the frontend
      // If not provided, default to 0 (will be handled by the frontend)
      const orderInProject = createTaskDto.orderInProject ?? 0;

      const taskData = {
        ...createTaskDto,
        project: projectId,
        board: new Types.ObjectId(createTaskDto.board),
        creator: creatorId,
        // For new tasks, lastModifier should be the same as creator
        lastModifier: creatorId,
        status: createTaskDto.status || TaskStatus.TODO,
        orderInProject,
        ...(createTaskDto.assignee && {
          assignee: new Types.ObjectId(createTaskDto.assignee)
        })
      };

      const createdTask = new this.taskModel(taskData);
      const savedTask = await createdTask.save();
      return await this.toTaskResponse(savedTask);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async findAll(
    projectId?: string,
    assigneeId?: string
  ): Promise<TaskResponseDto[]> {
    const query: any = {};

    if (projectId) {
      query.project = new Types.ObjectId(projectId);
    }

    if (assigneeId) {
      query.assignee = new Types.ObjectId(assigneeId);
    }

    const tasks = await this.taskModel
      .find(query)
      .sort({ orderInProject: 1 })
      .populate('lastModifier', 'name email')
      .exec();
    return Promise.all(tasks.map((task) => this.toTaskResponse(task)));
  }

  async findOne(id: string): Promise<TaskResponseDto> {
    const task = await this.taskModel
      .findById(id)
      .populate('lastModifier', 'name email')
      .exec();
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return this.toTaskResponse(task);
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string
  ): Promise<TaskResponseDto> {
    // Create update data with lastModifier set to current user
    const updateData: any = {
      ...updateTaskDto,
      lastModifier: new Types.ObjectId(userId),
      updatedAt: new Date()
    };

    // Remove any undefined values to prevent overwriting with undefined
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    // Handle assigneeId if present - convert to ObjectId or set to null
    if ('assigneeId' in updateData) {
      updateData.assignee = updateData.assigneeId
        ? new Types.ObjectId(updateData.assigneeId)
        : null;
      delete updateData.assigneeId;
    }

    // Use findByIdAndUpdate for an atomic operation and to get the updated doc
    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate('lastModifier', 'name email') // Explicitly populate lastModifier
      .exec();

    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return this.toTaskResponse(updatedTask);
  }

  async remove(id: string): Promise<void> {
    // Convert string ID to ObjectId
    const objectId = new Types.ObjectId(id);

    // First, find the task to get its project and order
    const taskToDelete = await this.taskModel.findById(objectId).exec();

    if (!taskToDelete) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    const { project: projectId, orderInProject: deletedOrder } = taskToDelete;

    // Delete the task
    const result = await this.taskModel.deleteOne({ _id: objectId }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    // Reorder remaining tasks in the same project
    // Decrease order by 1 for all tasks with order greater than deleted task
    await this.taskModel
      .updateMany(
        {
          project: projectId,
          orderInProject: { $gt: deletedOrder }
        },
        {
          $inc: { orderInProject: -1 }
        }
      )
      .exec();
  }

  async moveTask(
    taskId: string,
    newProjectId: string,
    newOrderInProject: number,
    userId: string
  ): Promise<TaskResponseDto> {
    console.log('=== moveTask called ===');
    console.log('Task ID:', taskId);
    console.log('New Project ID:', newProjectId);
    console.log('New Order:', newOrderInProject);
    console.log('User ID:', userId);

    // Validate inputs
    if (!Types.ObjectId.isValid(taskId)) {
      throw new Error('Invalid task ID');
    }
    if (!Types.ObjectId.isValid(newProjectId)) {
      throw new Error('Invalid project ID');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    // Find the task
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID "${taskId}" not found`);
    }

    const oldProjectId = task.project.toString();
    const oldOrderInProject = task.orderInProject ?? 0;

    console.log('Old Project ID:', oldProjectId);
    console.log('Old Order:', oldOrderInProject);

    // If moving to the same project, just update the order
    if (oldProjectId === newProjectId) {
      console.log('Moving within the same project');

      // Update the task's order
      task.project = new Types.ObjectId(newProjectId);
      task.orderInProject = newOrderInProject;
      task.lastModifier = new Types.ObjectId(userId);
      task.updatedAt = new Date();

      await task.save();

      // Reorder other tasks in the same project
      if (oldOrderInProject !== newOrderInProject) {
        if (newOrderInProject > oldOrderInProject) {
          // Moving down: decrease order for tasks between old and new position
          await this.taskModel.updateMany(
            {
              project: new Types.ObjectId(newProjectId),
              orderInProject: {
                $gt: oldOrderInProject,
                $lte: newOrderInProject
              },
              _id: { $ne: taskId }
            },
            { $inc: { orderInProject: -1 } }
          );
        } else {
          // Moving up: increase order for tasks between new and old position
          await this.taskModel.updateMany(
            {
              project: new Types.ObjectId(newProjectId),
              orderInProject: {
                $gte: newOrderInProject,
                $lt: oldOrderInProject
              },
              _id: { $ne: taskId }
            },
            { $inc: { orderInProject: 1 } }
          );
        }
      }
    } else {
      console.log('Moving to a different project');

      // Update the task's project and order
      task.project = new Types.ObjectId(newProjectId);
      task.orderInProject = newOrderInProject;
      task.lastModifier = new Types.ObjectId(userId);
      task.updatedAt = new Date();

      await task.save();

      // Reorder tasks in the old project (decrease order for tasks after the moved task)
      await this.taskModel.updateMany(
        {
          project: new Types.ObjectId(oldProjectId),
          orderInProject: { $gt: oldOrderInProject }
        },
        { $inc: { orderInProject: -1 } }
      );

      // Reorder tasks in the new project (increase order for tasks at or after the new position)
      await this.taskModel.updateMany(
        {
          project: new Types.ObjectId(newProjectId),
          orderInProject: { $gte: newOrderInProject },
          _id: { $ne: taskId }
        },
        { $inc: { orderInProject: 1 } }
      );
    }

    // Return the updated task
    const updatedTask = await this.taskModel
      .findById(taskId)
      .populate('creator', 'name email')
      .populate('assignee', 'name email')
      .populate('lastModifier', 'name email')
      .exec();

    if (!updatedTask) {
      throw new NotFoundException('Task not found after update');
    }

    console.log('Task moved successfully');
    return await this.toTaskResponse(updatedTask);
  }
}
