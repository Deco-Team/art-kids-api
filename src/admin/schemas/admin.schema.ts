import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Status, UserRole } from '@src/common/contracts/constant'
import { Transform } from 'class-transformer'
import { HydratedDocument } from 'mongoose'
import * as paginate from 'mongoose-paginate-v2'

export type AdminDocument = HydratedDocument<Admin>

@Schema({
  collection: 'admins',
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v
    }
  }
})
export class Admin {
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

  @Prop({ type: String, select: false })
  password: string

  @Prop({
    enum: Status,
    default: Status.ACTIVE
  })
  status: Status

  @Prop({
    enum: UserRole,
    default: UserRole.STAFF
  })
  role: UserRole
}

export const AdminSchema = SchemaFactory.createForClass(Admin)

AdminSchema.plugin(paginate)
AdminSchema.index({ email: 1 })
