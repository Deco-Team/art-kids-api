import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Transform } from 'class-transformer'
import { HydratedDocument } from 'mongoose'
import * as paginate from 'mongoose-paginate-v2'
import { UserSide } from '@common/contracts/constant'

export type TokenDocument = HydratedDocument<Token>

@Schema({
  collection: 'tokens',
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v
    }
  }
})
export class Token {
  constructor(id?: string) {
    this._id = id
  }

  @Transform(({ value }) => value?.toString())
  _id: string

  @Prop({ type: String, required: true })
  userId: string

  @Prop({
    enum: UserSide,
    default: UserSide.CUSTOMER
  })
  side: UserSide

  @Prop({ type: String, required: true })
  refreshToken: string
}

export const TokenSchema = SchemaFactory.createForClass(Token)

TokenSchema.plugin(paginate)
TokenSchema.index({ refreshToken: 1 })
