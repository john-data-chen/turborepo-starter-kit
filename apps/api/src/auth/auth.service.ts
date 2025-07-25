import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service"; // 假設你有一個 UserService

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  // Passport-local strategy 會呼叫這個方法
  async validateUser(email: string): Promise<any> {
    // 這裡的邏輯等同於你原本在 auth.ts 的 authorize 方法
    // 注意：我們只驗證 email 是否存在，如你需求所述
    const user = await this.userService.findByEmail(email);
    if (user) {
      // 為了安全，通常會回傳不含密碼的使用者物件
      const { ...result } = user;
      return result;
    }
    return null;
  }

  // 登入成功後，產生 JWT
  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
