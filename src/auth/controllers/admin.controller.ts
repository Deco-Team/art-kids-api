import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common"
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { UserSide } from "@common/contracts/constant"
import { ErrorResponse, SuccessDataResponse } from "@common/contracts/dto"
import { LoginReqDto } from "@auth/dto/login.dto"
import { TokenResDto } from "@auth/dto/token.dto"
import { AuthService } from "@auth/services/auth.service"
import { DataResponse } from "@common/contracts/openapi-builder"
import { JwtAuthGuard } from "@auth/guards/jwt-auth.guard"

@ApiTags('Auth - Admin')
@Controller('admin')
export class AuthAdminController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginReqDto })
  @ApiOkResponse({ type: DataResponse(TokenResDto) })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async login(@Body() loginReqDto: LoginReqDto): Promise<TokenResDto> {
    return await this.authService.login(loginReqDto, UserSide.ADMIN)
  }

  @UseGuards(JwtAuthGuard.REFRESH_TOKEN)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOkResponse({ type: SuccessDataResponse })
  async logout(@Req() req) {
    const res = await this.authService.logout(req.user['refreshToken'])
    return res
  }
}