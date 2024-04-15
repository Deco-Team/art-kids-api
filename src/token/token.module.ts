import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TokenRepository } from '@token/repositories/token.repository'
import { Token, TokenSchema } from './schemas/token.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }])],
  controllers: [],
  providers: [TokenRepository],
  exports: [TokenRepository]
})
export class TokenModule {}
