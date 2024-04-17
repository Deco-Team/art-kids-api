import { Injectable } from '@nestjs/common'
import { CourseRepository } from '@course/repositories/course.repository'
import { CreateCourseDto } from '@course/dto/course.dto'
import { Course } from '@course/schemas/course.schema'
import { AppException } from '@common/exceptions/app.exception'
import { Errors } from '@common/contracts/error'
import { FilterQuery } from 'mongoose'
import { PaginationParams } from '@common/decorators/pagination.decorator'
import { CourseStatus, LessonType } from '@common/contracts/constant'
import { SuccessResponse } from '@common/contracts/dto'
import { RejectCourseDto } from '@course/dto/reject-course.dto'

@Injectable()
export class CourseService {
  constructor(private readonly courseRepository: CourseRepository) {}

  public async getCoursesByAdmin(filter: FilterQuery<Course>, paginationParams: PaginationParams) {
    return await this.courseRepository.paginate(
      {
        ...filter,
        status: {
          $ne: CourseStatus.DELETED
        }
      },
      {
        ...paginationParams,
        projection: '-lessons',
        populate: {
          path: 'provider',
          select: ['_id', 'name', 'image']
        }
      }
    )
  }

  public async getCourseDetailByAdmin(courseId: string) {
    const result = await this.courseRepository.findOne({
      conditions: {
        _id: courseId,
        status: {
          $ne: CourseStatus.DELETED
        }
      },
      populates: [
        {
          path: 'provider',
          select: ['_id', 'name', 'image']
        }
      ]
    })
    if (!result) throw new AppException(Errors.COURSE_NOT_FOUND)
    return result
  }

  public async getCoursesByProvider(
    filter: FilterQuery<Course>,
    paginationParams: PaginationParams,
    providerId: string
  ) {
    return await this.courseRepository.paginate(
      {
        ...filter,
        status: {
          $ne: CourseStatus.DELETED
        },
        provider: providerId
      },
      {
        ...paginationParams,
        projection: '-lessons',
        populate: {
          path: 'provider',
          select: ['_id', 'name', 'image']
        }
      }
    )
  }

  public async getCourseDetailByProvider(courseId: string, providerId: string) {
    const result = await this.courseRepository.findOne({
      conditions: {
        _id: courseId,
        status: {
          $ne: CourseStatus.DELETED
        },
        provider: providerId
      }
    })
    if (!result) throw new AppException(Errors.COURSE_NOT_FOUND)
    return result
  }

  public async getCoursesByCustomer(filter: FilterQuery<Course>, paginationParams: PaginationParams) {
    return await this.courseRepository.paginate(
      {
        ...filter,
        // status: CourseStatus.PUBLISHED,
        status: {
          $ne: CourseStatus.DELETED
        }
      },
      {
        ...paginationParams,
        projection: '-lessons',
        populate: {
          path: 'provider',
          select: ['_id', 'name', 'image']
        }
      }
    )
  }

  public async getCourseDetailByCustomer(courseId: string) {
    const result = await this.courseRepository.findOne({
      conditions: {
        _id: courseId,
        // status: CourseStatus.PUBLISHED,
        status: {
          $ne: CourseStatus.DELETED
        }
      },
      populates: [
        {
          path: 'provider',
          select: ['_id', 'name', 'image']
        }
      ]
    })
    if (!result) throw new AppException(Errors.COURSE_NOT_FOUND)
    result.lessons = result.lessons.map((lesson) => {
      // hide lessons info if type FEE
      if (lesson.type === LessonType.FEE) {
        lesson.description = undefined
        lesson.objective = undefined
        lesson.video = undefined
      }
      return lesson
    })
    return result
  }

  public async createCourse(createCourseDto: CreateCourseDto, providerId: string) {
    let course = (await this.courseRepository.findOne({ conditions: { title: createCourseDto.title } })) as Course
    if (course) throw new AppException(Errors.COURSE_EXISTED)
    course = new Course()
    course = { ...course, ...createCourseDto, provider: providerId }

    return this.courseRepository.create(course)
  }

  public async approveCourse(courseId: string) {
    const course = await this.courseRepository.findOneAndUpdate(
      {
        _id: courseId,
        status: CourseStatus.PENDING
      },
      {
        $set: {
          status: CourseStatus.PUBLISHED
        }
      }
    )
    if (!course) throw new AppException(Errors.COURSE_NOT_FOUND)

    // send mail and notification

    return new SuccessResponse(true)
  }

  public async rejectCourse(courseId: string, rejectCourseDto: RejectCourseDto) {
    const course = await this.courseRepository.findOneAndUpdate(
      {
        _id: courseId,
        status: CourseStatus.PENDING
      },
      {
        $set: {
          status: CourseStatus.REJECTED,
          rejectReason: rejectCourseDto.rejectReason
        }
      }
    )
    if (!course) throw new AppException(Errors.COURSE_NOT_FOUND)

    // send mail and notification

    return new SuccessResponse(true)
  }
}
