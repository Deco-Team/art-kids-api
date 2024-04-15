import { Injectable } from '@nestjs/common'
import { AbstractRepository } from '@src/common/repositories'
import { InjectModel } from '@nestjs/mongoose'
import { PaginateModel } from 'mongoose'
import { CourseDocument, Course } from '../schemas/course.schema'

@Injectable()
export class CourseRepository extends AbstractRepository<CourseDocument> {
  constructor(@InjectModel(Course.name) model: PaginateModel<CourseDocument>) {
    super(model)
  }
}
