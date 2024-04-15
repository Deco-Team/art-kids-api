import { PaginateModel } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { AbstractRepository } from '@common/repositories'
import { Admin, AdminDocument } from '@admin/schemas/admin.schema'

@Injectable()
export class AdminRepository extends AbstractRepository<AdminDocument> {
  constructor(@InjectModel(Admin.name) model: PaginateModel<AdminDocument>) {
    super(model)
  }
}
