import { Controller, Get, Post, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";

import { RequestWithUser } from "../../common/interfaces/request-with-user.interface";

import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { EmailAuthGuard } from "./guards/email-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Post("login")
  @UseGuards(EmailAuthGuard)
  async login(
    @CurrentUser() user: RequestWithUser["user"],
    @Res({ passthrough: true }) res: Response
  ) {
    if (!user) {
      throw new UnauthorizedException("No user object found in request after authentication");
    }

    const result = await this.authService.login(user as any);

    const isProduction = this.configService.get<string>("NODE_ENV") === "production";
    const isVercel = this.configService.get<string>("VERCEL") === "1";

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction || isVercel,
      sameSite: "lax" as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    };

    res.cookie("jwt", result.access_token, cookieOptions);
    res.cookie("isAuthenticated", "true", {
      ...cookieOptions,
      httpOnly: false
    });

    return {
      user: result.user,
      access_token: result.access_token
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@CurrentUser() user: RequestWithUser["user"]) {
    return user;
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    const isProduction = this.configService.get<string>("NODE_ENV") === "production";
    const isVercel = this.configService.get<string>("VERCEL") === "1";

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction || isVercel,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0
    };

    res.clearCookie("jwt", cookieOptions);
    res.clearCookie("isAuthenticated", { ...cookieOptions, httpOnly: false });

    return { message: "Successfully logged out" };
  }
}
