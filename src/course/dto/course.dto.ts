import { CourseLevel, CourseStatus, LessonType } from '@common/contracts/constant'
import { PaginateResponse } from '@common/contracts/openapi-builder'
import { ApiProperty, OmitType, PickType } from '@nestjs/swagger'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  Max,
  Min
} from 'class-validator'

class LessonDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty()
  @IsString()
  description: string

  @ApiProperty()
  @IsString()
  objective: string

  @ApiProperty()
  @IsUrl()
  video: string

  @ApiProperty()
  @IsEnum(LessonType)
  type: LessonType

  //   @ApiProperty()
  //   status: string
}

export class CourseDto {
  @ApiProperty()
  @IsMongoId()
  _id: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty()
  @IsString()
  description: string

  @ApiProperty()
  @IsString()
  objective: string

  @ApiProperty()
  @IsUrl()
  thumbnail: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  duration: string

  @ApiProperty()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100000000)
  price: number

  @ApiProperty({
    enum: CourseLevel
  })
  @IsEnum(CourseLevel)
  level: CourseLevel

  @ApiProperty({
    enum: CourseStatus
  })
  @IsEnum(CourseStatus)
  status: CourseStatus

  @ApiProperty({ type: [LessonDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  lessons: LessonDto[]

  @ApiProperty()
  @IsMongoId()
  provider: string
}

export class CreateLessonDto extends PickType(LessonDto, [
  'title',
  'description',
  'objective',
  'video',
  'type'
] as const) {}

export class CreateCourseDto extends PickType(CourseDto, [
  'title',
  'description',
  'objective',
  'thumbnail',
  'duration',
  'price',
  'level'
] as const) {
  @ApiProperty({ type: [CreateLessonDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  lessons: CreateLessonDto[]
}

export class CoursePaginateDto extends PaginateResponse(CourseDto) {}

export class CustomerViewCourseDto extends OmitType(CourseDto, [
  'lessons',
] as const) {}

export class CustomerViewCoursePaginateDto extends PaginateResponse(CustomerViewCourseDto) {}
