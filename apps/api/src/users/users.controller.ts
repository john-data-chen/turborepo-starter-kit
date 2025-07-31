import { Controller, Get, UseGuards, Query } from "@nestjs/common";
import { UserService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard) // <-- This protects the route
  async findAll() {
    const users = await this.userService.findAll();
    return { users };
  }

  @Get("search")
  @UseGuards(JwtAuthGuard)
  async search(@Query("username") username: string) {
    const users = await this.userService.searchByName(username);
    return { users };
  }
}
