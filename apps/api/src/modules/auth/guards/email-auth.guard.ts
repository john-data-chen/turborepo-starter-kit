import { Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

@Injectable()
export class EmailAuthGuard extends AuthGuard("email") {}
