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

@ApiTags('Order - Customer')
@ApiBearerAuth()
@ApiBadRequestResponse({ type: ErrorResponse })
@Sides(UserSide.CUSTOMER)
@UseGuards(JwtAuthGuard.ACCESS_TOKEN, SidesGuard)
@Controller('customer')
export class OrderCustomerController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new order(orderStatus: PENDING, transactionStatus: DRAFT)'
  })
  // @ApiOkResponse({ type: CreateMomoPaymentResponseDto })
  @ApiOkResponse({ type: SuccessDataResponse })
  async createOrder(@Req() req, @Body() createOrderDto: CreateOrderDto) {
    createOrderDto.customer = _.get(req, 'user._id')
    const result = await this.orderService.createOrder(createOrderDto)
    return result
  }

  @Get()
  @ApiOperation({
    summary: 'Customer can view order list'
  })
  @ApiOkResponse({ type: OrderPaginateResponseDto })
  @ApiQuery({ type: PaginationQuery })
  async getOrders(@Req() req, @Pagination() paginationParams: PaginationParams) {
    const customerId = _.get(req, 'user._id')
    return await this.orderService.getOrderList({ 'customer': customerId }, paginationParams)
  }

  @Get(':orderId')
  @ApiOperation({
    summary: 'Customer can view order detail'
  })
  @ApiOkResponse({ type: DataResponse(OrderDto) })
  async getPurchaseDetails(@Req() req, @Param('orderId') orderId: string) {
    const customerId = _.get(req, 'user._id')
    return await this.orderService.getOrderDetail({ 'customer': customerId, _id: orderId })
  }
}
