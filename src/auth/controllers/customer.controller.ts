import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ErrorResponse, SuccessDataResponse } from '@common/contracts/dto'
import { LoginReqDto } from '@auth/dto/login.dto'
import { AuthService } from '@auth/services/auth.service'
import { TokenResDto } from '@auth/dto/token.dto'
import { UserSide } from '@common/contracts/constant'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { RegisterReqDto } from '@auth/dto/register.dto'
import { DataResponse } from '@common/contracts/openapi-builder'

@ApiTags('Auth - Customer')
@Controller('customer')
@ApiBadRequestResponse({ type: ErrorResponse })
export class AuthCustomerController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginReqDto })
  @ApiOkResponse({ type: DataResponse(TokenResDto) })
  login(@Body() loginReqDto: LoginReqDto): Promise<TokenResDto> {
    return this.authService.login(loginReqDto, UserSide.CUSTOMER)
  }

  @Post('register')
  @ApiBody({ type: RegisterReqDto })
  @ApiOkResponse({ type: SuccessDataResponse })
  async register(@Body() registerReqDto: RegisterReqDto) {
    return await this.authService.register(registerReqDto)
  }

  @UseGuards(JwtAuthGuard.REFRESH_TOKEN)
  @Post('refresh')
  @ApiBearerAuth()
  @ApiOkResponse({ type: DataResponse(TokenResDto) })
  async refreshToken(@Req() req): Promise<TokenResDto> {
    const res = await this.authService.refreshTokens(req.user._id, UserSide.CUSTOMER, req.user['refreshToken'])
    return res
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
