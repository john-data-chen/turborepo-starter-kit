import { Module } from "@nestjs/common";
import { UserService } from "./user.service";

@Module({
  providers: [UserService],
  exports: [UserService], // Make UserService available to other modules
})
export class UserModule {}
