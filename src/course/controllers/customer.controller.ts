import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { CourseService } from '@course/services/course.service'
import { CourseDto, CustomerViewCoursePaginateDto } from '../dto/course.dto'
import { DataResponse } from '@common/contracts/openapi-builder'
import { Sides } from '@auth/decorators/sides.decorator'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { SidesGuard } from '@auth/guards/sides.guard'
import { UserSide } from '@common/contracts/constant'
import { PaginationQuery } from '@common/contracts/dto'
import { Pagination, PaginationParams } from '@common/decorators/pagination.decorator'
import { ParseObjectIdPipe } from '@common/pipes/parse-object-id.pipe'
import { FilterCourseDto } from '@course/dto/filter-course.dto'

@ApiTags('Course - Customer')
// @ApiBearerAuth()
// @Sides(UserSide.CUSTOMER)
// @UseGuards(JwtAuthGuard.ACCESS_TOKEN, SidesGuard)
@Controller('customer')
export class CustomerCourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
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

  @Get(':id')
  @ApiOkResponse({ type: DataResponse(CourseDto) })
  @ApiParam({ name: 'id' })
  getCourseDetails(@Param('id', ParseObjectIdPipe) id: string) {
    return this.courseService.getCourseDetailByCustomer(id)
  }
}
