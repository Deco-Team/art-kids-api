import { LessonType } from '@common/contracts/constant'
import { Prop, Schema } from '@nestjs/mongoose'

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

  @Prop({ type: String, slug: 'title', unique: true })
  slug: string

  @Prop({ type: String })
  description: string

  @Prop({ type: String })
  objective: string

  @Prop({ type: String })
  video: string

  @Prop({ enum: LessonType, default: LessonType.FEE })
  type: LessonType

  // @Prop()
  // status: string
}
