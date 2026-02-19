import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { BoardController } from "./boards.controller";
import { BoardService } from "./boards.service";
import { BoardRepository } from "./repositories/boards.repository";
import { Board, BoardSchema } from "./schemas/boards.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: Board.name, schema: BoardSchema }])],
  controllers: [BoardController],
  providers: [BoardRepository, BoardService],
  exports: [BoardService]
})
export class BoardsModule {}
