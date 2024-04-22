import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { DataResponse, PaginateResponse } from '@src/common/contracts/openapi-builder'
import { ArrayMinSize, IsEnum, IsMongoId, IsNotEmpty, MaxLength, MinLength, ValidateNested } from 'class-validator'
import { OrderHistoryDto, OrderItemDto } from '@order/schemas/order.schema'
import { Type } from 'class-transformer'
import { OrderStatus, TransactionStatus } from '@src/common/contracts/constant'
// import { PaymentMethod } from '@payment/contracts/constant'
import { PaymentDto } from '@payment/dto/payment.dto'
import { PaymentMethod } from '@payment/contracts/constant'

export class CreateOrderItemDto {
  @ApiProperty()
  @IsMongoId()
  courseId: string

  price?: number
}

export class CreateOrderDto {
  @ApiProperty({ isArray: true, type: CreateOrderItemDto })
  @IsNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[]

  // @ApiProperty({ enum: PaymentMethod })
  // @IsNotEmpty()
  // @IsEnum(PaymentMethod)
  // paymentMethod?: PaymentMethod

  customer?: string
  orderId?: string
  totalAmount?: number
}

export class OrderDto {
  @ApiProperty()
  _id: string

  @ApiProperty()
  orderNumber: string

  @ApiProperty()
  customer: string

  @ApiProperty({ isArray: true, type: OrderItemDto })
  items: OrderItemDto[]

  @ApiProperty()
  totalAmount: number

  @ApiProperty()
  orderDate: Date

  @ApiProperty({ enum: OrderStatus })
  orderStatus: OrderStatus

  @ApiProperty({ enum: TransactionStatus })
  transactionStatus: TransactionStatus

  // @ApiProperty()
  // payment: PaymentDto
}

export class OrderPaginateResponseDto extends DataResponse(
  class OrderPaginateResponse extends PaginateResponse(OrderDto) {}
) {}

export class OrderResponseDto extends DataResponse(OrderDto) {}

export class CancelOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(256)
  @MinLength(10)
  reason: string

  orderId?: string
  orderHistoryItem?: OrderHistoryDto
}

export class PublicOrderHistoryDto {
  @ApiProperty()
  orderStatus: OrderStatus

  @ApiProperty()
  transactionStatus: TransactionStatus

  @ApiProperty()
  timestamp: Date
}
