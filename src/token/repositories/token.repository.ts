import { PaginateModel } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { AbstractRepository } from '@common/repositories'
import { Token, TokenDocument } from '@token/schemas/token.schema'

@Injectable()
export class TokenRepository extends AbstractRepository<TokenDocument> {
  constructor(@InjectModel(Token.name) model: PaginateModel<TokenDocument>) {
    super(model)
  }
}
