import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger'
import { DataResponse, PaginateResponse } from '@src/common/contracts/openapi-builder'
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsUrl, MaxLength } from 'class-validator'
import { StaffRole, Status, UserRole } from '@src/common/contracts/constant'
import { Staff } from '@staff/schemas/staff.schema'
import { Types } from 'mongoose'

export class CreateStaffDto {
  @ApiProperty({ example: 'Name' })
  @IsNotEmpty()
  @MaxLength(30)
  name: string

  // @ApiProperty({ example: 'https://i.stack.imgur.com/l60Hf.png' })
  // @IsNotEmpty()
  // @IsUrl()
  // avatar: string

  @ApiProperty({ example: 'staff@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string

  password?: string
  providerId?: Types.ObjectId
  createdBy?: string
}

export class StaffDto {
  @ApiProperty()
  _id: string

  @ApiProperty()
  name: string

  @ApiProperty()
  email: string

  // @ApiProperty()
  // avatar: string

  @ApiProperty()
  role: UserRole

  @ApiProperty()
  status: Status
}

export class StaffPaginateResponseDto extends DataResponse(
  class StaffPaginateResponse extends PaginateResponse(Staff) {}
) {}

export class StaffResponseDto extends DataResponse(Staff) {}

export class FilterStaffDto {
  // @ApiPropertyOptional({
  //   enum: StaffRole,
  // })
  // @IsOptional()
  // @IsEnum(StaffRole)
  // role: StaffRole;
}