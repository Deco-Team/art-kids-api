import { LessonType } from '@common/contracts/constant'
import { Prop, Schema } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema({
  _id: false,
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v
    }
  }
})
export class Lesson {
  @Prop({ type: String })
  title: string

  @Prop({ type: String })
  description: string

  @Prop({ type: String })
  objective: string

  @Prop({ type: String })
  video: string

  @Prop({ enum: LessonType, default: LessonType.PAID })
  type: LessonType

  @Prop({
    type: Types.ObjectId,
    ref: 'Course'
  })
  course?: string

  // @Prop()
  // status: string
}
