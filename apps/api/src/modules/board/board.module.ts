import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Board, BoardSchema } from "./schemas/board.schema";
import { BoardService } from "./services/board.service";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Board.name, schema: BoardSchema }]),
    UserModule,
  ],
  providers: [BoardService],
  exports: [MongooseModule, BoardService],
})
export class BoardModule {}
