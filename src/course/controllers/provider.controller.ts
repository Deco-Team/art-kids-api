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

@ApiTags('Course - Provider')
@ApiBearerAuth()
@Sides(UserSide.PROVIDER)
@UseGuards(JwtAuthGuard.ACCESS_TOKEN, SidesGuard)
@Controller('provider')
export class ProviderCourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @ApiOkResponse({ type: DataResponse(CoursePaginateDto) })
  @ApiQuery({ type: PaginationQuery })
  getCourses(@Request() req, @Pagination() paginationParams: PaginationParams) {
    const providerId = getObjectPropValue(req, 'user._id')
    const filter = {}

    return this.courseService.getCoursesByProvider(filter, paginationParams, providerId)
  }

  @Get(':id')
  @ApiOkResponse({ type: DataResponse(CourseDto) })
  @ApiParam({ name: 'id' })
  getCourseDetails(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    const providerId = getObjectPropValue(req, 'user._id')

    return this.courseService.getCourseDetailByProvider(id, providerId)
  }

  @Post()
  @ApiCreatedResponse({ type: DataResponse(CourseDto) })
  createCourse(@Request() req, @Body() createCourseDto: CreateCourseDto) {
    const providerId = getObjectPropValue(req, 'user._id')
    return this.courseService.createCourse(createCourseDto, providerId)
  }
}
