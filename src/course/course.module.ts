import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Course, CourseSchema } from './schemas/course.schema'
import { ProviderCourseController } from './controllers/provider.controller'
import { CourseService } from './services/course.service'
import { CourseRepository } from './repositories/course.repository'
import { CustomerCourseController } from './controllers/customer.controller'
import { AdminCourseController } from './controllers/admin.controller'
import { CustomerCourse, CustomerCourseSchema } from './schemas/customer-course.schema'
import { CustomerCourseRepository } from './repositories/customer-course.repository'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: CustomerCourse.name, schema: CustomerCourseSchema }
    ])
  ],
  controllers: [ProviderCourseController, CustomerCourseController, AdminCourseController],
  providers: [CourseService, CourseRepository, CustomerCourseRepository],
  exports: [CourseService, CustomerCourseRepository, CourseRepository]
})
export class CourseModule {}
