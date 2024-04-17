import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { CourseService } from '@course/services/course.service'
import { CourseDto, CoursePaginateDto, CreateCourseDto } from '../dto/course.dto'
import { get as getObjectPropValue } from 'lodash'
import { DataResponse } from '@common/contracts/openapi-builder'
import { Sides } from '@auth/decorators/sides.decorator'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { SidesGuard } from '@auth/guards/sides.guard'
import { UserSide } from '@common/contracts/constant'
import { PaginationQuery } from '@common/contracts/dto'
import { Pagination, PaginationParams } from '@common/decorators/pagination.decorator'
import { ParseObjectIdPipe } from '@common/pipes/parse-object-id.pipe'

@ApiTags('Course - Customer')
@ApiBearerAuth()
@Sides(UserSide.CUSTOMER)
@UseGuards(JwtAuthGuard.ACCESS_TOKEN, SidesGuard)
@Controller('customer')
export class CustomerCourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @ApiOkResponse({ type: DataResponse(CoursePaginateDto) })
  @ApiQuery({ type: PaginationQuery })
  getCourses(@Pagination() paginationParams: PaginationParams) {
    const filter = {}

    return this.courseService.getCoursesByCustomer(filter, paginationParams)
  }

  @Get(':id')
  @ApiOkResponse({ type: DataResponse(CourseDto) })
  @ApiParam({ name: 'id' })
  getCourseDetails(@Param('id', ParseObjectIdPipe) id: string) {
    return this.courseService.getCourseDetailByCustomer(id)
  }
}
