import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { UserService } from './users.service'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard) // <-- This protects the route
  async findAll() {
    const users = await this.userService.findAll()
    return { users }
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async search(@Query('username') username: string) {
    const users = await this.userService.searchByName(username)
    return { users }
  }
}
