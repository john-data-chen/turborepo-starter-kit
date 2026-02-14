import { IsDateString, IsEnum, IsMongoId, IsOptional, IsString } from "class-validator";

import { ProjectStatus } from "../schemas/projects.schema";

// Re-export for backward compatibility
export { ProjectStatus };

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsMongoId()
  @IsOptional()
  assigneeId?: string | null;

  @IsOptional()
  orderInBoard?: number;
}
