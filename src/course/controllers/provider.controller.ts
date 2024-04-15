import { Controller } from '@nestjs/common'
import {
  ApiTags
} from '@nestjs/swagger'
import { CourseService } from '../services/course.service'

@ApiTags('Course - Provider')
@Controller('provider')
export class ProviderCourseController {
  constructor(private readonly courseService: CourseService) {}
}
