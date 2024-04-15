import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { CourseLevel, CourseStatus, ProductStatus } from '@src/common/contracts/constant'
import { Transform } from 'class-transformer'
import { HydratedDocument, Types } from 'mongoose'
import * as paginate from 'mongoose-paginate-v2'
import * as slug from 'mongoose-slug-updater'
import { Lesson } from './lesson.schema'

@Schema({
  collection: 'courses',
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v
    }
  }
})
export class Course {
  constructor(id?: string) {
    this._id = id
  }
  @Transform(({ value }) => value?.toString())
  _id: string

  @Prop({ type: String })
  title: string

  @Prop({ type: String, slug: 'title', unique: true })
  slug: string

  @Prop({ type: String })
  description: string

  @Prop({ type: String })
  objective: string

  @Prop({ type: String })
  thumbnail: string

  @Prop({ type: String })
  duration: string

  @Prop({ type: Number, default: 0 })
  price: number

  @Prop({
    enum: CourseLevel,
    default: CourseLevel.EASY
  })
  level: CourseLevel

  @Prop({
    enum: CourseStatus,
    default: CourseStatus.PENDING
  })
  status: CourseStatus

  @Prop({
    type: [Lesson]
  })
  lessons: Lesson[]

//   @Prop({
//     type: String
//   })
//   instructor: string
}

export type CourseDocument = HydratedDocument<Course>

export const CourseSchema = SchemaFactory.createForClass(Course)

CourseSchema.plugin(paginate)
CourseSchema.plugin(slug)
