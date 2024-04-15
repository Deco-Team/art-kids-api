import { JwtService } from '@nestjs/jwt'
import { BadRequestException, Injectable, NotAcceptableException, UnauthorizedException } from '@nestjs/common'
import { LoginReqDto } from '@auth/dto/login.dto'
import { CustomerRepository } from '@customer/repositories/customer.repository'
import { Errors } from '@common/contracts/error'
import { Customer } from '@customer/schemas/customer.schema'
import { UserSide, UserRole, Status } from '@common/contracts/constant'
import * as bcrypt from 'bcrypt'
import { AccessTokenPayload } from '@auth/strategies/jwt-access.strategy'
import { RefreshTokenPayload } from '@auth/strategies/jwt-refresh.strategy'
import { TokenResDto } from '@auth/dto/token.dto'
import { ConfigService } from '@nestjs/config'
import { RegisterReqDto } from '@auth/dto/register.dto'
import { SuccessResponse } from '@common/contracts/dto'
import { ProviderRepository } from '@provider/repositories/provider.repository'
import { AdminRepository } from '@admin/repositories/admin.repository'
import { Provider } from '@provider/schemas/provider.schema'
import { Admin } from '@admin/schemas/admin.schema'
import { TokenRepository } from '@token/repositories/token.repository'

@Injectable()
export class AuthService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly providerRepository: ProviderRepository,
    private readonly adminRepository: AdminRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  public async login(loginReqDto: LoginReqDto, side: UserSide): Promise<TokenResDto> {
    let user: Customer | Provider | Admin
    let userRole: UserRole

    if (side === UserSide.CUSTOMER) {
      user = await this.customerRepository.findOne({
        conditions: {
          email: loginReqDto.email
        },
        projection: '+password'
      })
    }

    if (side === UserSide.PROVIDER) {
      user = await this.providerRepository.findOne({
        conditions: {
          email: loginReqDto.email
        },
        projection: '+password'
      })
    }

    if (side === UserSide.ADMIN) {
      user = await this.adminRepository.findOne({
        conditions: {
          email: loginReqDto.email
        },
        projection: '+password'
      })
      userRole = user?.role
    }

    if (!user) throw new BadRequestException(Errors.WRONG_EMAIL_OR_PASSWORD.message)
    if (user.status === Status.INACTIVE) throw new BadRequestException(Errors.INACTIVE_ACCOUNT.message)

    const isPasswordMatch = await this.comparePassword(loginReqDto.password, user.password)
    if (!isPasswordMatch) throw new BadRequestException(Errors.WRONG_EMAIL_OR_PASSWORD.message)

    const accessTokenPayload: AccessTokenPayload = { name: user.name, sub: user._id, role: userRole, side }
    const refreshTokenPayload: RefreshTokenPayload = { sub: user._id, role: userRole, side }

    const tokens = this.generateTokens(accessTokenPayload, refreshTokenPayload)

    //save refresh token to implement logout
    await this.tokenRepository.create({
      userId: user._id,
      side,
      refreshToken: tokens.refreshToken
    })

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
  }

  public async register(registerReqDto: RegisterReqDto) {
    const customer = await this.customerRepository.findOne({
      conditions: {
        email: registerReqDto.email
      }
    })

    if (customer) throw new BadRequestException(Errors.EMAIL_ALREADY_EXIST.message)

    const password = await this.hashPassword(registerReqDto.password)

    await this.customerRepository.create({
      name: registerReqDto.name,
      email: registerReqDto.email,
      phone: registerReqDto.phone,
      password
    })

    return new SuccessResponse(true)
  }

  public async refreshTokens(id: string, side: UserSide, refreshToken: string): Promise<TokenResDto> {
    let tokens: TokenResDto
    const token = await this.tokenRepository.findOne({
      conditions: {
        refreshToken
      }
    })
    if (!token) throw new NotAcceptableException()

    if (side === UserSide.CUSTOMER) {
      const user = await this.customerRepository.findOne({ conditions: { _id: id } })

      if (!user) throw new UnauthorizedException()

      const accessTokenPayload: AccessTokenPayload = { name: user.name, sub: user._id, side }
      const refreshTokenPayload: RefreshTokenPayload = { sub: user._id, side }
      tokens = this.generateTokens(accessTokenPayload, refreshTokenPayload)
    }
    // update new refresh token
    await this.tokenRepository.findOneAndUpdate(
      { refreshToken },
      {
        refreshToken: tokens.refreshToken
      }
    )

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
  }

  public async logout(refreshToken: string) {
    const token = await this.tokenRepository.findOne({
      conditions: {
        refreshToken
      }
    })
    if (!token) throw new NotAcceptableException()

    // update new refresh token
    await this.tokenRepository.findOneAndDelete({ refreshToken })

    return new SuccessResponse(true)
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(password, salt)
    return hash
  }

  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }

  private generateTokens(accessTokenPayload: AccessTokenPayload, refreshTokenPayload: RefreshTokenPayload) {
    return {
      accessToken: this.jwtService.sign(accessTokenPayload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION')
      }),
      refreshToken: this.jwtService.sign(refreshTokenPayload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION')
      })
    }
  }
}
