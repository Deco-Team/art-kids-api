import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import * as _ from 'lodash'

import { CustomerService } from '@customer/services/customer.service'
import { ErrorResponse } from '@common/contracts/dto'
import { UserSide } from '@common/contracts/constant'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { CustomerResponseDto } from '@customer/dto/customer.dto'
import { Sides } from '@auth/decorators/sides.decorator'
import { SidesGuard } from '@auth/guards/sides.guard'

@ApiTags('Customer')
@ApiBearerAuth()
@Sides(UserSide.CUSTOMER)
@UseGuards(JwtAuthGuard.ACCESS_TOKEN, SidesGuard)
@Controller()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}
  
  @ApiOperation({
    summary: 'Get customer information'
  })
  @Get('me')
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiOkResponse({ type: CustomerResponseDto })
  getOwnInformation(@Req() req) {
    const { _id } = _.get(req, 'user')
    return this.customerService.getCustomerDetail(_id)
  }
}
