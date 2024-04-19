import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Transform } from 'class-transformer'
import { HydratedDocument, Types } from 'mongoose'
import * as paginate from 'mongoose-paginate-v2'
import { CourseDto, LessonDto } from '@course/dto/course.dto'

export type CustomerCourseDocument = HydratedDocument<CustomerCourse>

export class LessonProgressDto extends LessonDto {
  @Prop({
    type: Boolean,
    default: false
  })
  isCompleted = false
}

export class CourseProgress extends CourseDto {
  @Prop({
    type: [LessonProgressDto],
  })
  lessons: LessonProgressDto[]
}

@Schema({
  collection: 'customer-courses',
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v
    }
  }
})
export class CustomerCourse {
  constructor(id?: string) {
    this._id = id
  }
  @Transform(({ value }) => value?.toString())
  _id: string

  @Prop({
    type: Types.ObjectId,
    ref: 'Customer'
  })
  customer: string

  @Prop({
    type: CourseProgress
  })
  course: CourseProgress
}

export const CustomerCourseSchema = SchemaFactory.createForClass(CustomerCourse)
CustomerCourseSchema.plugin(paginate)
