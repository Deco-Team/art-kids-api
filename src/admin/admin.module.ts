import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Admin, AdminSchema } from '@admin/schemas/admin.schema'
import { AdminRepository } from '@admin/repositories/admin.repository'

@Module({
  imports: [MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }])],
  controllers: [],
  providers: [AdminRepository],
  exports: [AdminRepository]
})
export class AdminModule {}
