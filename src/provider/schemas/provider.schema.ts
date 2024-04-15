import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Gender, Status } from '@src/common/contracts/constant'
import { Transform } from 'class-transformer'
import { HydratedDocument } from 'mongoose'
import * as paginate from 'mongoose-paginate-v2'

export type ProviderDocument = HydratedDocument<Provider>

@Schema({
  collection: 'providers',
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v
    }
  }
})
export class Provider {
  constructor(id?: string) {
    this._id = id
  }

  @ApiProperty()
  @Transform(({ value }) => value?.toString())
  _id: string

  @ApiProperty()
  @Prop({ type: String, maxlength: 30, required: true })
  name: string

  @ApiProperty()
  @Prop({
    type: String,
    required: true
  })
  email: string

  @ApiProperty()
  @Prop({
    type: String,
    required: true
  })
  phone: string

  @Prop({ type: String, select: false })
  password: string

  @ApiProperty()
  @Prop({ enum: Gender, default: Gender.OTHER })
  gender: Gender

  @Prop({
    enum: Status,
    default: Status.ACTIVE
  })
  status: Status

  @ApiProperty()
  @Prop({
    type: String
  })
  image?: string

  @ApiProperty()
  @Prop({
    type: String
  })
  introduction?: string

  @ApiProperty()
  @Prop({
    type: String
  })
  education?: string

  @ApiProperty()
  @Prop({
    type: String
  })
  expertise?: string
}

export const ProviderSchema = SchemaFactory.createForClass(Provider)

ProviderSchema.plugin(paginate)
ProviderSchema.index({ email: 1 })
