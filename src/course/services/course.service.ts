import { Injectable } from '@nestjs/common'
import { CourseRepository } from '../repositories/course.repository'
import { CreateCourseDto } from '../dto/course.dto'
import { Course } from '../schemas/course.schema'
import { AppException } from '@common/exceptions/app.exception'
import { Errors } from '@common/contracts/error'
import { FilterQuery } from 'mongoose'
import { PaginationParams } from '@common/decorators/pagination.decorator'
import { CourseStatus } from '@common/contracts/constant'

@Injectable()
export class CourseService {
  constructor(private readonly courseRepository: CourseRepository) {}

  public async getProviderCourses(filter: FilterQuery<Course>, paginationParams: PaginationParams, providerId: string) {
    return await this.courseRepository.paginate(
      {
        ...filter,
        status: {
          $ne: CourseStatus.DELETED
        },
        providerId
      },
      {
        ...paginationParams
      }
    )
  }

  public async getProviderCourseDetails(courseId: string, providerId: string) {
    const result = await this.courseRepository.findOne({
      conditions: {
        _id: courseId,
        status: {
          $ne: CourseStatus.DELETED
        },
        providerId
      }
    })
    if (!result) throw new AppException(Errors.COURSE_NOT_FOUND)
    return result
  }

  public async createCourse(createCourseDto: CreateCourseDto, providerId: string) {
    let course = (await this.courseRepository.findOne({ conditions: { title: createCourseDto.title } })) as Course
    if (course) throw new AppException(Errors.COURSE_EXISTED)
    course = new Course()
    course = { ...course, ...createCourseDto, providerId }

    return this.courseRepository.create(course)
  }
}
