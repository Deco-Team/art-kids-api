import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Course, CourseSchema } from './schemas/course.schema'
import { ProviderCourseController } from './controllers/provider.controller'
import { CourseService } from './services/course.service'
import { CourseRepository } from './repositories/course.repository'

@Module({
  imports: [MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }])],
  controllers: [ProviderCourseController],
  providers: [CourseService, CourseRepository],
  exports: [CourseService]
})
export class CourseModule {}
