import { ApiProperty } from '@nestjs/swagger'
import { PHONE_REGEX } from '@src/config'
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsStrongPassword, Matches, MaxLength } from 'class-validator'

export class RegisterReqDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(30)
  name: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber('VN')
  phone: string

  @ApiProperty()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string
}
