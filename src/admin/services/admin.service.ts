import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateStaffDto } from '@admin/dto/staff.dto'
import { ProviderRepository } from '@provider/repositories/provider.repository'
import { IDResponse, SuccessResponse } from '@common/contracts/dto'
import { AuthService } from '@auth/services/auth.service'
import { MailerService } from '@nestjs-modules/mailer'
import { MongoServerError } from 'mongodb'
import * as _ from 'lodash'
import { InjectConnection } from '@nestjs/mongoose'
import { Connection, FilterQuery } from 'mongoose'
import { PaginationParams } from '@common/decorators/pagination.decorator'
import { Status, UserRole } from '@common/contracts/constant'
import { AppException } from '@common/exceptions/app.exception'
import { Errors } from '@common/contracts/error'
import { AdminRepository } from '@admin/repositories/admin.repository'
import { Admin } from '@admin/schemas/admin.schema'

@Injectable()
export class AdminService {
  constructor(
    @InjectConnection() readonly connection: Connection,
    private readonly adminRepository: AdminRepository,
    private readonly authService: AuthService,
    private readonly mailerService: MailerService
  ) {}

  public async create(createStaffDto: CreateStaffDto) {
    const session = await this.connection.startSession()
    session.startTransaction()
    try {
      // Generate random password
      const password = Math.random().toString(36).slice(-8)
      createStaffDto.password = await this.authService.hashPassword(password)

      let admin: Admin
      try {
        admin = await this.adminRepository.create({ ...createStaffDto, role: UserRole.STAFF }, { session })
      } catch (err) {
        if (err instanceof MongoServerError) {
          const { code, keyPattern, keyValue } = err
          if (code === 11000) {
            if (_.get(keyPattern, 'email') === 1) throw new AppException(Errors.EMAIL_ALREADY_EXIST)
          }
        }
        console.error(err)
        throw err
      }
      // Send email
      try {
        await this.mailerService.sendMail({
          to: createStaffDto.email,
          subject: '[ArtKids] Thông tin đăng nhập hệ thống',
          template: 'invite-staff',
          context: {
            name: `${createStaffDto.name}`,
            email: createStaffDto.email,
            password
          }
        })
      } catch (error) {
        console.error(`send mail error=${error}, stack=${JSON.stringify(error['stack'])}`)
        if (error['responseCode'] === 501) {
          console.error('501 can not send mail')
          throw new BadRequestException('Email service is in stuck. Please try again later!')
        } else {
          throw error
        }
      }

      await session.commitTransaction()
      return new IDResponse(admin._id)
    } catch (error) {
      await session.abortTransaction()
      throw error
    }
  }

  public async paginate(filter: FilterQuery<Admin>, paginationParams: PaginationParams) {
    const result = await this.adminRepository.paginate(
      {
        role: {
          $in: [UserRole.STAFF]
        },
        status: {
          $ne: Status.DELETED
        },
        ...filter
      },
      { projection: '-password', ...paginationParams }
    )
    return result
  }

  public async getOne(filter: FilterQuery<Admin>) {
    const staff = await this.adminRepository.findOne({
      conditions: {
        role: {
          $in: [UserRole.STAFF]
        },
        status: {
          $ne: Status.DELETED
        },
        ...filter
      },
      projection: '-password'
    })
    if (!staff) throw new AppException(Errors.STAFF_NOT_FOUND)

    return staff
  }
}
