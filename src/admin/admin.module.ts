import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Admin, AdminSchema } from '@admin/schemas/admin.schema'
import { AdminRepository } from '@admin/repositories/admin.repository'
import { AdminService } from './services/admin.service'
import { AccountsAdminController } from './controllers/admin.controller'

@Module({
  imports: [MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }])],
  controllers: [AccountsAdminController],
  providers: [AdminRepository, AdminService],
  exports: [AdminRepository]
})
export class AdminModule {}
