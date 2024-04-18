import { AuthService } from '@auth/services/auth.service'
import { Status } from '@common/contracts/constant'
import { Errors } from '@common/contracts/error'
import { AppException } from '@common/exceptions/app.exception'
import { MailerService } from '@nestjs-modules/mailer'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import { CreateProviderDto } from '@provider/dto/provider.dto'
import { ProviderRepository } from '@provider/repositories/provider.repository'
import { Provider } from '@provider/schemas/provider.schema'
import { Connection } from 'mongoose'

@Injectable()
export class ProviderService {
  constructor(
    @InjectConnection() readonly connection: Connection,
    private readonly providerRepository: ProviderRepository,
    private readonly authService: AuthService,
    private readonly mailerService: MailerService
  ) {}

  public async createProvider(createProviderDto: CreateProviderDto) {
    let provider = (await this.providerRepository.findOne({
      conditions: { email: createProviderDto.email }
    })) as Provider
    if (provider) throw new AppException(Errors.PROVIDER_EXISTED)

    const password = Math.random().toString(36).slice(-8)
    const hashedPassword = await this.authService.hashPassword(password)

    provider = new Provider()
    provider = { ...provider, ...createProviderDto, password: hashedPassword, status: Status.ACTIVE }

    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      provider = await this.providerRepository.create(provider)

      try {
        await this.mailerService.sendMail({
          to: provider.email,
          subject: '[Furnique] Thông tin đăng nhập hệ thống',
          template: 'invite-staff',
          context: {
            name: provider.name,
            email: provider.email,
            password
          }
        })
      } catch (error) {
        console.error(`send mail error=${error}, stack=${JSON.stringify(error['stack'])}`)
        if (error['responseCode'] === 501) {
          console.error('501 can not send mail')
          throw new BadRequestException('Dịch vụ email đang gặp sự cố. Vui lòng thử lại sau!')
        } else {
          throw error
        }
      }

      await session.commitTransaction()
      provider.password = undefined
      return provider
    } catch (error) {
      await session.abortTransaction()
      throw error
    }
  }
}
