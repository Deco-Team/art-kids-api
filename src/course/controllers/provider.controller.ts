import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import { CourseService } from '../services/course.service'
import { CourseDto, CreateCourseDto } from '../dto/course.dto'
import { get as getObjectPropValue } from 'lodash'
import { DataResponse } from '@common/contracts/openapi-builder'
import { Sides } from '@auth/decorators/sides.decorator'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { SidesGuard } from '@auth/guards/sides.guard'
import { UserSide } from '@common/contracts/constant'

@ApiTags('Course - Provider')
@Controller('provider')
export class ProviderCourseController {
  constructor(private readonly courseService: CourseService) {}

  @ApiBearerAuth()
  @Sides(UserSide.CUSTOMER)
  @UseGuards(JwtAuthGuard.ACCESS_TOKEN, SidesGuard)
  @Post()
  @ApiCreatedResponse({ type: DataResponse(CourseDto) })
  createProduct(@Request() req, @Body() createCourseDto: CreateCourseDto) {
    const providerId = getObjectPropValue(req, 'user._id')
    return this.courseService.createCourse(createCourseDto, providerId)
  }
}
