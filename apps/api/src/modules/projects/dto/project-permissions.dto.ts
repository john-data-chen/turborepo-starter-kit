import { ApiProperty } from '@nestjs/swagger';

export class ProjectPermissionsDto {
  @ApiProperty({ description: 'Whether the user can edit the project' })
  canEditProject: boolean;

  @ApiProperty({ description: 'Whether the user can delete the project' })
  canDeleteProject: boolean;
}
