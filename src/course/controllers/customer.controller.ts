import { Body, Controller, Get, Param, Patch, Query, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
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
import { FilterCourseDto } from '@course/dto/filter-course.dto'
import { get } from 'lodash'
import { Types } from 'mongoose'
import { MyCourseDto, MyCoursePaginateDto } from '@course/dto/my-course.dto'
import { CompleteLessonCourseDto } from '@course/dto/complete-lesson-course.dto'

@ApiTags('Course - Customer')
@Controller('customer')
export class CustomerCourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @ApiOperation({
    summary: 'Guest can view public course list'
  })
  @ApiOkResponse({ type: DataResponse(CustomerViewCoursePaginateDto) })
  @ApiQuery({ type: PaginationQuery })
  getCourses(@Pagination() paginationParams: PaginationParams, @Query() filterCourseDto: FilterCourseDto) {
    const condition = {}

    if (filterCourseDto.title) {
      condition['$text'] = {
        $search: filterCourseDto.title
      }
    }

    if (filterCourseDto.type) {
      condition['type'] = filterCourseDto.type
    }

    if (filterCourseDto.level) {
      condition['level'] = filterCourseDto.level
    }

    if (filterCourseDto.fromPrice !== undefined && filterCourseDto.toPrice !== undefined) {
      condition['price'] = { $gte: filterCourseDto.fromPrice, $lte: filterCourseDto.toPrice }
    }

    return this.courseService.getCoursesByCustomer(condition, paginationParams)
  }

  @Get('my-courses')
  @ApiOperation({
    summary: 'Customer can view my courses'
  })
  @ApiOkResponse({ type: DataResponse(MyCoursePaginateDto) })
  @ApiQuery({ type: PaginationQuery })
  @ApiBearerAuth()
  @Sides(UserSide.CUSTOMER)
  @UseGuards(JwtAuthGuard.ACCESS_TOKEN, SidesGuard)
  getMyCourses(@Request() req, @Pagination() paginationParams: PaginationParams) {
    const condition = { customer: get(req, 'user._id') }

    return this.courseService.getMyCourses(condition, paginationParams)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Guest can view public course detail'
  })
  @ApiOkResponse({ type: DataResponse(CourseDto) })
  @ApiParam({ name: 'id' })
  getCourseDetails(@Param('id', ParseObjectIdPipe) id: string) {
    return this.courseService.getCourseDetailByCustomer(id)
  }

  @Get('my-courses/:id')
  @ApiOperation({
    summary: 'Customer can view course detail(show all unlocked lessons)'
  })
  @ApiBearerAuth()
  @Sides(UserSide.CUSTOMER)
  @UseGuards(JwtAuthGuard.ACCESS_TOKEN, SidesGuard)
  @ApiOkResponse({ type: DataResponse(MyCourseDto) })
  @ApiParam({ name: 'id' })
  getMyCourseDetail(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    const condition = { customer: get(req, 'user._id'), 'course._id': new Types.ObjectId(id) }
    return this.courseService.getMyCourseDetail(condition)
  }

  @Patch('my-courses/:courseId/complete-lesson')
  @ApiOperation({
    summary: 'Customer can complete a lesson in my course'
  })
  @ApiBearerAuth()
  @Sides(UserSide.CUSTOMER)
  @UseGuards(JwtAuthGuard.ACCESS_TOKEN, SidesGuard)
  @ApiOkResponse({ type: SuccessDataResponse })
  @ApiParam({ name: 'courseId' })
  completeLesson(
    @Request() req,
    @Param('courseId', ParseObjectIdPipe) courseId: string,
    @Body() completeLessonCourseDto: CompleteLessonCourseDto
  ) {
    const condition = { customer: get(req, 'user._id'), 'course._id': new Types.ObjectId(courseId) }
    return this.courseService.completeLessonCourse(condition, completeLessonCourseDto)
  }
}
