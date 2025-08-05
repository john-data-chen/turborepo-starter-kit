# Tasks API

This directory contains the client-side implementation for interacting with the tasks API using TanStack Query.

## API Endpoints

- `GET /tasks` - Get all tasks (optionally filtered by projectId or assigneeId)
- `GET /tasks/:id` - Get a single task by ID
- `POST /tasks` - Create a new task
- `PATCH /tasks/:id` - Update a task
- `PATCH /tasks/:id/status` - Update a task's status
- `DELETE /tasks/:id` - Delete a task

## Available Hooks

### Queries

#### `useTasks(projectId?, assigneeId?)`

Fetch a list of tasks, optionally filtered by project or assignee.

```typescript
const { data: tasks, isLoading, error } = useTasks(projectId, assigneeId);
```

#### `useTask(taskId)`

Fetch a single task by ID.

```typescript
const { data: task, isLoading, error } = useTask(taskId);
```

### Mutations

#### `useCreateTask()`

Create a new task.

```typescript
const createTask = useCreateTask();

// Usage:
createTask.mutate({
  title: 'New Task',
  description: 'Task description',
  projectId: 'project-123',
  boardId: 'board-123'
  // ...other task properties
});
```

#### `useUpdateTask()`

Update an existing task.

```typescript
const updateTask = useUpdateTask();

// Usage:
updateTask.mutate({
  id: 'task-123',
  title: 'Updated Task Title',
  description: 'Updated description'
  // ...other fields to update
});
```

#### `useUpdateTaskStatus()`

Update a task's status.

```typescript
const updateStatus = useUpdateTaskStatus();

// Usage:
updateStatus.mutate({
  id: 'task-123',
  status: 'IN_PROGRESS' // or 'TODO' or 'DONE'
});
```

#### `useDeleteTask()`

Delete a task.

```typescript
const deleteTask = useDeleteTask();

// Usage:
deleteTask.mutate('task-123');
```

## TypeScript Types

The following types are available:

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate?: Date;
  board: string; // Board ID
  project: string; // Project ID
  assignee?: string; // User ID
  creator: string; // User ID
  lastModifier: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}
```

## Cache Management

All hooks automatically handle cache invalidation and optimistic updates. The following query keys are used:

- `['tasks', 'list', { projectId?, assigneeId? }]` - Task lists
- `['tasks', 'detail', taskId]` - Single task

## Error Handling

All hooks return error states that can be used to display error messages to the user:

```typescript
const { error } = useTasks(projectId);

if (error) {
  return <div>Error loading tasks: {error.message}</div>;
}
```

## Loading States

Loading states are provided for better UX:

```typescript
const { isLoading, isFetching } = useTasks(projectId);

if (isLoading) {
  return <div>Loading tasks...</div>;
}
```

> Note: `isLoading` is true only on initial load, while `isFetching` is true during any data fetch.

## Technical Decision

- **Database**: [MongoDB](https://www.mongodb.com/), [Docker compose](https://docs.docker.com/compose/), [Mongoose](https://github.com/Automattic/mongoose) - NoSQL database for storing data in a document-oriented format.
