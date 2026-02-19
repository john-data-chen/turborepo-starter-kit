import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { UserRepository } from "./repositories/users.repository";
import { User, UserSchema } from "./schemas/users.schema";
import { UserController } from "./users.controller";
import { UserService } from "./users.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UserController],
  providers: [UserRepository, UserService],
  exports: [UserService]
})
export class UsersModule {}
