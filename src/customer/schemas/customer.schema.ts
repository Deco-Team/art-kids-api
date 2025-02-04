import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import * as paginate from 'mongoose-paginate-v2'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { Gender, Status } from '@common/contracts/constant'

export type CustomerDocument = HydratedDocument<Customer>

@Schema({
  collection: 'customers',
  timestamps: {
    createdAt: true,
    updatedAt: true
  },
  toJSON: {
    transform(doc, ret) {
      delete ret.__v
    }
  }
})
export class Customer {
  constructor(id?: string) {
    this._id = id
  }
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
    type: String
  })
  phone: string

  @Prop({ type: String, select: false })
  password: string

  @Prop({
    enum: Status,
    default: Status.ACTIVE
  })
  status: Status

  @ApiProperty()
  @Prop({ type: Date })
  dateOfBirth?: Date

  @ApiProperty()
  @Prop({
    type: String
  })
  image?: string
}

export const CustomerSchema = SchemaFactory.createForClass(Customer)

CustomerSchema.plugin(paginate)
CustomerSchema.index({ email: 1 })
