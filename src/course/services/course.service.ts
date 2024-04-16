import { Injectable } from '@nestjs/common'
import { CourseRepository } from '../repositories/course.repository'
import { CreateCourseDto } from '../dto/course.dto'
import { Course } from '../schemas/course.schema'
import { AppException } from '@common/exceptions/app.exception'
import { Errors } from '@common/contracts/error'

@Injectable()
export class CourseService {
  constructor(private readonly courseRepository: CourseRepository) {}

  public async createCourse(createCourseDto: CreateCourseDto, providerId: string) {
    let course = (await this.courseRepository.findOne({ conditions: { title: createCourseDto.title } })) as Course
    if (course) throw new AppException(Errors.COURSE_EXISTED)
    course = new Course()
    course = { ...course, ...createCourseDto, providerId }

    return this.courseRepository.create(course)
  }
}
