import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { CourseService } from '@course/services/course.service'
import { CourseDto, CustomerViewCoursePaginateDto } from '../dto/course.dto'
import { DataResponse } from '@common/contracts/openapi-builder'
import { Sides } from '@auth/decorators/sides.decorator'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { SidesGuard } from '@auth/guards/sides.guard'
import { UserSide } from '@common/contracts/constant'
import { PaginationQuery, SuccessDataResponse } from '@common/contracts/dto'
import { Pagination, PaginationParams } from '@common/decorators/pagination.decorator'
import { ParseObjectIdPipe } from '@common/pipes/parse-object-id.pipe'
import { RejectCourseDto } from '@course/dto/reject-course.dto'

@ApiTags('Course - Admin')
@ApiBearerAuth()
@Sides(UserSide.ADMIN)
@UseGuards(JwtAuthGuard.ACCESS_TOKEN, SidesGuard)
@Controller('admin')
export class AdminCourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @ApiOkResponse({ type: DataResponse(CustomerViewCoursePaginateDto) })
  @ApiQuery({ type: PaginationQuery })
  getCourses(@Pagination() paginationParams: PaginationParams) {
    const filter = {}

    return this.courseService.getCoursesByAdmin(filter, paginationParams)
  }

  @Get(':id')
  @ApiOkResponse({ type: DataResponse(CourseDto) })
  @ApiParam({ name: 'id' })
  getCourseDetails(@Param('id', ParseObjectIdPipe) id: string) {
    return this.courseService.getCourseDetailByAdmin(id)
  }

  @Patch(':id/approve')
  @ApiOkResponse({ type: SuccessDataResponse })
  approveCourse(@Param('id', ParseObjectIdPipe) courseId: string) {
    return this.courseService.approveCourse(courseId)
  }

  @Patch(':id/reject')
  @ApiOkResponse({ type: SuccessDataResponse })
  rejectCourse(@Param('id', ParseObjectIdPipe) courseId: string, @Body() rejectCourseDto: RejectCourseDto) {
    return this.courseService.rejectCourse(courseId, rejectCourseDto)
  }
}
