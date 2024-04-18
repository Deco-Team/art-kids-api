import { Gender, Status } from '@common/contracts/constant'
import { ApiProperty, OmitType } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsString, IsUrl } from 'class-validator'

export class ProviderDto {
  @ApiProperty()
  @IsMongoId()
  _id: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsString()
  phone: string

  @ApiProperty({
    enum: Gender
  })
  @IsEnum(Gender)
  gender: Gender

  @ApiProperty({
    enum: Status
  })
  @IsEnum(Status)
  status: Status

  @ApiProperty()
  @IsUrl()
  image?: string

  @ApiProperty()
  @IsString()
  introduction: string

  @ApiProperty()
  @IsString()
  education: string

  @ApiProperty()
  @IsString()
  expertise: string
}

export class CreateProviderDto extends OmitType(ProviderDto, ['_id', 'status']) {}
