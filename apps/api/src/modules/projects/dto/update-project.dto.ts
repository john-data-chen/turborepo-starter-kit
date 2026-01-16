import { IsDateString, IsEnum, IsMongoId, IsOptional, IsString } from "class-validator"

export enum ProjectStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  ARCHIVED = "ARCHIVED"
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  title?: string

  @IsString()
  @IsOptional()
  description?: string | null

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus

  @IsDateString()
  @IsOptional()
  dueDate?: string

  @IsMongoId()
  @IsOptional()
  assigneeId?: string | null

  @IsOptional()
  orderInBoard?: number
}
