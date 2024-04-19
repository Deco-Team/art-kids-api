import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import * as _ from 'lodash'

import { ErrorResponse, IDDataResponse, PaginationQuery, SuccessDataResponse } from '@common/contracts/dto'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { RolesGuard } from '@auth/guards/roles.guard'
import { Roles } from '@auth/decorators/roles.decorator'
import { CreateStaffDto, FilterStaffDto, StaffPaginateResponseDto, StaffResponseDto } from '@admin/dto/staff.dto'
import { UserRole } from '@common/contracts/constant'
import { Pagination, PaginationParams } from '@common/decorators/pagination.decorator'
import { ParseObjectIdPipe } from '@common/pipes/parse-object-id.pipe'
import { AdminService } from '@admin/services/admin.service'

@ApiTags('Account - Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard.ACCESS_TOKEN)
@Controller('accounts/admin')
export class AccountsAdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new admin account(role STAFF)'
  })
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ type: IDDataResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  createStaff(@Body() createStaffDto: CreateStaffDto) {
    return this.adminService.create(createStaffDto)
  }

  @Get()
  @ApiOperation({
    summary: 'Paginate list admin (role STAFF)'
  })
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ type: StaffPaginateResponseDto })
  @ApiQuery({ type: PaginationQuery })
  getListStaff(@Pagination() paginationParams: PaginationParams, @Query() filterStaffDto: FilterStaffDto) {
    return this.adminService.paginate(filterStaffDto, paginationParams)
  }

  @Get(':adminId')
  @ApiOperation({
    summary: 'View admin (role STAFF) detail'
  })
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ type: StaffResponseDto })
  getStaffDetail(@Param('adminId', ParseObjectIdPipe) adminId: string) {
    return this.adminService.getOne({ _id: adminId })
  }
}
