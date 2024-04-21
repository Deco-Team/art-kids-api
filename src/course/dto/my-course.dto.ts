import { PaginateResponse } from '@common/contracts/openapi-builder'
import { ApiProperty } from '@nestjs/swagger'
import { CourseDto, LessonDto } from './course.dto'

export class MyLessonDto extends LessonDto {
  @ApiProperty()
  isCompleted: boolean
}

export class MyCourseDto extends CourseDto {
  @ApiProperty({ type: [MyLessonDto] })
  lessons: MyLessonDto[]

  @ApiProperty()
  completedLessons: number

  @ApiProperty()
  totalLessons?: number
}

export class MyCoursePaginateDto extends PaginateResponse(MyCourseDto) {}