import { PartialType } from "@nestjs/mapped-types";

import { CreateBoardDto } from "./create-boards.dto";

export class UpdateBoardDto extends PartialType(CreateBoardDto) {}
