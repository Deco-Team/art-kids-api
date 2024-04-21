import { Injectable } from '@nestjs/common'
import { CourseRepository } from '@course/repositories/course.repository'
import { CreateCourseDto } from '@course/dto/course.dto'
import { Course } from '@course/schemas/course.schema'
import { AppException } from '@common/exceptions/app.exception'
import { Errors } from '@common/contracts/error'
import { FilterQuery } from 'mongoose'
import { PaginationParams } from '@common/decorators/pagination.decorator'
import { CourseStatus, CourseType, LessonType } from '@common/contracts/constant'
import { SuccessResponse } from '@common/contracts/dto'
import { RejectCourseDto } from '@course/dto/reject-course.dto'
import { CustomerCourse } from '@course/schemas/customer-course.schema'
import { CustomerCourseRepository } from '@course/repositories/customer-course.repository'
import { CompleteLessonCourseDto } from '@course/dto/complete-lesson-course.dto'

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly customerCourseRepository: CustomerCourseRepository
  ) {}

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
        status: CourseStatus.PUBLISHED
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
        status: CourseStatus.PUBLISHED
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
      // hide lessons info if type PAID
      if (lesson.type === LessonType.PAID) {
        lesson.description = undefined
        lesson.objective = undefined
        lesson.video = undefined
      }
      return lesson
    })
    return result
  }

  public async getMyCourses(filter: FilterQuery<CustomerCourse>, paginationParams: PaginationParams) {
    return await this.customerCourseRepository
      .paginate(
        {
          ...filter
        },
        {
          ...paginationParams,
          populate: {
            path: 'course',
            populate: {
              path: 'provider',
              model: 'Provider',
              select: ['_id', 'name', 'image']
            }
          }
        }
      )
      .then((result) => {
        const docs = result.docs.map((doc) => {
          const course = doc.course
          const completedLessons = course.lessons.filter((lesson) => lesson.isCompleted === true).length
          return { ...course, completedLessons, totalLessons: course.lessons.length }
        })
        return { ...result, docs }
      })
  }

  public async getMyCourseDetail(filter: FilterQuery<CustomerCourse>) {
    const result = await this.customerCourseRepository.findOne({
      conditions: filter,
      populates: [
        {
          path: 'course',
          populate: {
            path: 'provider',
            model: 'Provider',
            select: ['_id', 'name', 'image']
          }
        }
      ]
    })

    if (!result) throw new AppException(Errors.MY_COURSE_NOT_FOUND)
    const course = result.course
    const completedLessons = result.course.lessons.filter((lesson) => lesson.isCompleted === true).length
    return { ...course, completedLessons, totalLessons: course.lessons.length }
  }

  public async createCourse(createCourseDto: CreateCourseDto, providerId: string) {
    let course = (await this.courseRepository.findOne({ conditions: { title: createCourseDto.title } })) as Course
    if (course) throw new AppException(Errors.COURSE_EXISTED)

    if (createCourseDto.type === CourseType.FREE) {
      createCourseDto.price = 0
      createCourseDto.lessons.map((lesson) => {
        lesson.type = LessonType.FREE
        return lesson
      })
    }
    if (createCourseDto.type === CourseType.PAID) {
      if (createCourseDto.price <= 0) throw new AppException(Errors.PAID_COURSE_MUST_HAVE_POSITIVE_PRICE)
      if (createCourseDto.lessons.findIndex((lesson) => lesson.type === LessonType.PAID) === -1)
        throw new AppException(Errors.PAID_COURSE_MUST_HAVE_AT_LEAST_ONE_PAID_LESSON)
    }
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

  public async completeLessonCourse(
    filter: FilterQuery<CustomerCourse>,
    completeLessonCourseDto: CompleteLessonCourseDto
  ) {
    const customerCourse = await this.customerCourseRepository.findOne({ conditions: filter })
    const lessons = customerCourse.course.lessons
    if (completeLessonCourseDto.lessonIndex > lessons.length - 1) return new SuccessResponse(false)
    lessons[completeLessonCourseDto.lessonIndex].isCompleted = true
    await this.customerCourseRepository.findOneAndUpdate(
      {
        _id: customerCourse._id
      },
      {
        $set: {
          'course.lessons': lessons
        }
      }
    )
    return new SuccessResponse(true)
  }
}
