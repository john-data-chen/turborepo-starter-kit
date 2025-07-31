import { ApiProperty } from '@nestjs/swagger';

export class TaskPermissionsDto {
  @ApiProperty({ description: 'Whether the user can edit the task' })
  canEdit: boolean;

  @ApiProperty({ description: 'Whether the user can delete the task' })
  canDelete: boolean;
}
