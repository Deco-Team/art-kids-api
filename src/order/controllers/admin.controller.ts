import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger'
import * as _ from 'lodash'

import { ErrorResponse, PaginationQuery, SuccessDataResponse } from '@common/contracts/dto'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { UserSide } from '@common/contracts/constant'
import { CreateOrderDto, OrderDto, OrderPaginateResponseDto, PublicOrderHistoryDto } from '@order/dto/order.dto'
import { OrderService } from '@order/services/order.service'
import { Pagination, PaginationParams } from '@common/decorators/pagination.decorator'
import { DataResponse } from '@common/contracts/openapi-builder'
import { CreateMomoPaymentResponseDto } from '@payment/dto/momo-payment.dto'
import { Sides } from '@auth/decorators/sides.decorator'
import { SidesGuard } from '@auth/guards/sides.guard'

@ApiTags('Order - Admin')
@ApiBearerAuth()
@ApiBadRequestResponse({ type: ErrorResponse })
@Sides(UserSide.ADMIN)
@UseGuards(JwtAuthGuard.ACCESS_TOKEN, SidesGuard)
@Controller('admin')
export class OrderAdminController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({
    summary: 'Admin can view order list'
  })
  @ApiOkResponse({ type: OrderPaginateResponseDto })
  @ApiQuery({ type: PaginationQuery })
  async getOrders(@Pagination() paginationParams: PaginationParams) {
    return await this.orderService.getOrderListByAdmin({}, paginationParams)
  }

  @Get(':orderId')
  @ApiOperation({
    summary: 'Customer can view order detail'
  })
  @ApiOkResponse({ type: DataResponse(OrderDto) })
  async getPurchaseDetails(@Param('orderId') orderId: string) {
    return await this.orderService.getOrderDetailByAdmin({ _id: orderId })
  }
}
