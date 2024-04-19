import { Injectable } from '@nestjs/common'
import { AbstractRepository } from '@src/common/repositories'
import { InjectModel } from '@nestjs/mongoose'
import { PaginateModel } from 'mongoose'
import { CustomerCourse, CustomerCourseDocument } from '@course/schemas/customer-course.schema'

@Injectable()
export class CustomerCourseRepository extends AbstractRepository<CustomerCourseDocument> {
  constructor(@InjectModel(CustomerCourse.name) model: PaginateModel<CustomerCourseDocument>) {
    super(model)
  }
}
