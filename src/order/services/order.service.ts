import { Injectable, Logger } from '@nestjs/common'
import { OrderRepository } from '@order/repositories/order.repository'
import { PaginationParams } from '@common/decorators/pagination.decorator'
import { CourseStatus, OrderStatus, TransactionStatus, UserRole } from '@common/contracts/constant'
import { CancelOrderDto, CreateOrderDto } from '@order/dto/order.dto'
import { ClientSession, Connection, FilterQuery, Types } from 'mongoose'
import { Order, OrderHistoryDto, OrderItemDto } from '@order/schemas/order.schema'
import { SuccessResponse } from '@common/contracts/dto'
import { AppException } from '@src/common/exceptions/app.exception'
import { Errors } from '@src/common/contracts/error'
import { CartService } from '@cart/services/cart.service'
import { InjectConnection } from '@nestjs/mongoose'
import { ProductRepository } from '@product/repositories/product.repository'
import { PaymentRepository } from '@payment/repositories/payment.repository'
import { PaymentMethod } from '@payment/contracts/constant'
import { PaymentService } from '@payment/services/payment.service'
import {
  CreateMomoPaymentDto,
  CreateMomoPaymentResponse,
  QueryMomoPaymentDto,
  RefundMomoPaymentDto
} from '@payment/dto/momo-payment.dto'
import { ConfigService } from '@nestjs/config'
import { MailerService } from '@nestjs-modules/mailer'
import { CustomerCourseRepository } from '@course/repositories/customer-course.repository'
import { Course, CourseDocument } from '@course/schemas/course.schema'
import { CourseRepository } from '@course/repositories/course.repository'

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name)
  constructor(
    @InjectConnection() readonly connection: Connection,
    private readonly orderRepository: OrderRepository,
    private readonly courseRepository: CourseRepository,
    private readonly customerCourseRepository: CustomerCourseRepository,
    private readonly paymentService: PaymentService,
    private readonly paymentRepository: PaymentRepository,
    private readonly cartService: CartService,
    private readonly productRepository: ProductRepository,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService
  ) {}

  public async getOrderList(filter: FilterQuery<Order>, paginationParams: PaginationParams) {
    const result = await this.orderRepository.paginate(
      {
        ...filter
        // transactionStatus: TransactionStatus.CAPTURED,
        // status: OrderStatus.COMPLETED
      },
      {
        ...paginationParams,
        populate: {
          path: 'items',
          populate: { path: 'course', model: 'Course', select: '-lessons' }
        }
      }
    )
    return result
  }

  public async getOrderDetail(filter: FilterQuery<Order>) {
    const order = await this.orderRepository.findOne({
      conditions: {
        ...filter
        // transactionStatus: TransactionStatus.CAPTURED,
        // status: OrderStatus.COMPLETED
      },
      populates: [
        {
          path: 'items',
          populate: { path: 'course', model: 'Course', select: '-lessons' }
        }
      ]
    })
    if (!order) throw new AppException(Errors.ORDER_NOT_FOUND)
    return order
  }

  public async createOrder(createOrderDto: CreateOrderDto) {
    // Execute in transaction
    const session = await this.connection.startSession()
    session.startTransaction()
    try {
      // 1. Check if course is ordered before or invalid
      const courseIds = createOrderDto.items.map((item) => new Types.ObjectId(item.courseId))
      const orderedCoursesCount = await this.customerCourseRepository.model.countDocuments({
        customer: createOrderDto.customer,
        'course._id': {
          $in: courseIds
        }
      })
      if (orderedCoursesCount > 0) throw new AppException(Errors.COURSE_ALREADY_ORDERED)

      const courses = await this.courseRepository.findMany({
        conditions: {
          _id: {
            $in: courseIds
          },
          status: CourseStatus.PUBLISHED
        }
      })
      if (courses.length !== courseIds.length) throw new AppException(Errors.ORDER_ITEMS_INVALID)

      // 2. Transform input data
      const orderNumber = `ARTKIDS${new Date().getTime()}${Math.floor(Math.random() * 100)}`
      let totalAmount = 0
      const orderItems: OrderItemDto[] = []
      const customerCourses = []
      courses.forEach((course) => {
        totalAmount += course.price
        orderItems.push({ course: course._id, price: course.price })
        customerCourses.push({
          customer: createOrderDto.customer,
          course: {
            ...course.toJSON(),
            lessons: course.toJSON().lessons.map((lesson) => {
              return { ...lesson, isCompleted: false }
            })
          }
        })
      })

      // 3. Process transaction
      // let createMomoPaymentResponse: CreateMomoPaymentResponse
      // switch (createOrderDto?.paymentMethod) {
      //   case PaymentMethod.ZALO_PAY:
      //   // implement later
      //   case PaymentMethod.MOMO:
      //   default:
      //     this.paymentService.setStrategy(this.paymentService.momoPaymentStrategy)
      //     const createMomoPaymentDto: CreateMomoPaymentDto = {
      //       partnerName: 'ARTKIDS',
      //       orderInfo: `ArtKids - Thanh toán đơn hàng #${orderNumber}`,
      //       redirectUrl: `${this.configService.get('WEB_URL')}/customer/orders`,
      //       ipnUrl: `${this.configService.get('SERVER_URL')}/payment/webhook`,
      //       requestType: 'payWithMethod',
      //       amount: totalAmount,
      //       orderId: orderNumber,
      //       requestId: orderNumber,
      //       extraData: '',
      //       autoCapture: true,
      //       lang: 'vi',
      //       orderExpireTime: 15
      //     }
      //     createMomoPaymentResponse = await this.paymentService.createTransaction(createMomoPaymentDto)
      //     break
      // }

      // 4. Create payment
      // const payment = await this.paymentRepository.create(
      //   {
      //     transactionStatus: TransactionStatus.DRAFT,
      //     transaction: createMomoPaymentResponse,
      //     paymentMethod: createOrderDto.paymentMethod,
      //     amount: totalAmount
      //   },
      //   {
      //     session
      //   }
      // )

      // 5. Create customer courses
      await this.customerCourseRepository.model.insertMany(customerCourses, {
        session
      })

      // 6. Create order
      await this.orderRepository.create(
        {
          ...createOrderDto,
          orderNumber,
          items: orderItems,
          totalAmount
          // payment
        },
        {
          session
        }
      )

      await session.commitTransaction()
      // return createMomoPaymentResponse
      return new SuccessResponse(true)
    } catch (error) {
      await session.abortTransaction()
      console.error(error)
      throw error
    }
  }

  // public async confirmOrder(orderId: string, userId: string, role: UserRole) {
  //   // 1. Update order status and order history
  //   const orderHistory = new OrderHistoryDto(OrderStatus.CONFIRMED, TransactionStatus.CAPTURED, userId, role)
  //   const order = await this.orderRepository.findOneAndUpdate(
  //     {
  //       _id: orderId,
  //       orderStatus: OrderStatus.PENDING,
  //       transactionStatus: TransactionStatus.CAPTURED
  //     },
  //     {
  //       $set: { orderStatus: OrderStatus.CONFIRMED },
  //       $push: { orderHistory }
  //     }
  //   )
  //   if (!order) throw new AppException(Errors.ORDER_STATUS_INVALID)

  //   // 2. Send email/notification to customer
  //   return new SuccessResponse(true)
  // }

  // public async assignDeliveryToOrder(orderId: string, session?: ClientSession) {
  //   // 1. Update isDeliveryAssigned
  //   const order = await this.orderRepository.findOneAndUpdate(
  //     {
  //       _id: orderId,
  //       orderStatus: OrderStatus.CONFIRMED,
  //       transactionStatus: TransactionStatus.CAPTURED
  //     },
  //     {
  //       $set: { isDeliveryAssigned: true }
  //     },
  //     {
  //       session
  //     }
  //   )
  //   if (!order) throw new AppException(Errors.ORDER_STATUS_INVALID)

  //   return order
  // }

  // public async deliveryOrder(orderId: string, userId: string, role: UserRole, session?: ClientSession) {
  //   // 1. Update order status and order history
  //   const orderHistory = new OrderHistoryDto(OrderStatus.DELIVERING, TransactionStatus.CAPTURED, userId, role)
  //   const order = await this.orderRepository.findOneAndUpdate(
  //     {
  //       _id: orderId,
  //       orderStatus: OrderStatus.CONFIRMED,
  //       transactionStatus: TransactionStatus.CAPTURED
  //     },
  //     {
  //       $set: { orderStatus: OrderStatus.DELIVERING, deliveryDate: new Date() },
  //       $push: { orderHistory }
  //     },
  //     {
  //       session
  //     }
  //   )
  //   if (!order) throw new AppException(Errors.ORDER_STATUS_INVALID)

  //   return order
  // }

  // public async cancelOrder(cancelOrderDto: CancelOrderDto) {
  //   // Execute in transaction
  //   const session = await this.connection.startSession()
  //   session.startTransaction()
  //   try {
  //     const { orderId, orderHistoryItem, reason } = cancelOrderDto
  //     // 1. Update order status, reason and order history
  //     this.logger.log(`1. Update order status, reason and order history`)
  //     const order = await this.orderRepository.findOneAndUpdate(
  //       {
  //         _id: orderId,
  //         orderStatus: { $in: [OrderStatus.PENDING, OrderStatus.CONFIRMED] },
  //         transactionStatus: TransactionStatus.CAPTURED
  //       },
  //       {
  //         $set: { orderStatus: OrderStatus.CANCELED, transactionStatus: TransactionStatus.CANCELED, reason },
  //         $push: { orderHistory: orderHistoryItem }
  //       },
  //       {
  //         projection: '+items',
  //         session
  //       }
  //     )
  //     if (!order) throw new AppException(Errors.ORDER_STATUS_INVALID)

  //     this.logger.log(`2. Push update quantity in product.variants to operation to execute later`)
  //     // 2. Push update quantity in product.variants to operation to execute later
  //     // array to process bulk update
  //     const operations = []
  //     const { items } = order
  //     items.forEach((item) => {
  //       operations.push({
  //         updateOne: {
  //           filter: { 'variants.sku': item.sku },
  //           update: { $inc: { 'variants.$.quantity': item.quantity } },
  //           session
  //         }
  //       })
  //     })
  //     await this.productRepository.model.bulkWrite(operations)

  //     // 3. Refund payment via MOMO
  //     this.logger.log(`3. Refund payment via MOMO::`)
  //     const refundOrderId = `FUR${new Date().getTime()}${Math.floor(Math.random() * 100)}`
  //     this.paymentService.setStrategy(this.paymentService.momoPaymentStrategy)
  //     const refundMomoPaymentDto: RefundMomoPaymentDto = {
  //       orderId: refundOrderId,
  //       requestId: refundOrderId,
  //       amount: order.payment?.amount,
  //       transId: order.payment?.transaction['transId'],
  //       lang: 'vi',
  //       description: `Furnique - Hoàn tiền đơn hàng #${orderId}`
  //     }
  //     const refundedTransaction = await this.paymentService.refundTransaction(refundMomoPaymentDto)
  //     this.logger.log(JSON.stringify(refundedTransaction))

  //     // 4. Fetch newest transaction of order
  //     this.logger.log(`4. Fetch newest transaction of order`)
  //     const queryMomoPaymentDto: QueryMomoPaymentDto = {
  //       orderId: order.orderId,
  //       requestId: order.orderId,
  //       lang: 'vi'
  //     }
  //     const transaction = await this.paymentService.getTransaction(queryMomoPaymentDto)
  //     this.logger.log(JSON.stringify(transaction))

  //     // 5. Update payment transactionStatus, transaction
  //     this.logger.log(`5. Update payment transactionStatus, transaction`)
  //     const payment = await this.paymentRepository.findOneAndUpdate(
  //       {
  //         _id: order.payment._id
  //       },
  //       {
  //         $set: {
  //           transactionStatus: TransactionStatus.REFUNDED,
  //           transaction: transaction
  //         },
  //         $push: { transactionHistory: transaction }
  //       },
  //       {
  //         session,
  //         new: true
  //       }
  //     )
  //     // 6. Update order transactionStatus, payment
  //     this.logger.log(`6. Update order transactionStatus, payment`)
  //     await this.orderRepository.findOneAndUpdate(
  //       {
  //         _id: order._id
  //       },
  //       {
  //         $set: {
  //           transactionStatus: TransactionStatus.REFUNDED,
  //           payment: payment
  //         }
  //       },
  //       {
  //         session
  //       }
  //     )

  //     // 7. Send email/notification to customer
  //     this.logger.log(`7. Send email/notification to customer`)
  //     await this.mailerService.sendMail({
  //       to: order.customer.email,
  //       subject: `[Furnique] Thông báo hủy đơn hàng #${order.orderId}`,
  //       template: 'order-canceled',
  //       context: {
  //         ...order.toJSON(),
  //         _id: order._id,
  //         orderId: order.orderId,
  //         customer: order.customer,
  //         items: order.items.map((item) => {
  //           const variant = item.product.variants.find((variant) => variant.sku === item.sku)
  //           return {
  //             ...item,
  //             product: {
  //               ...item.product,
  //               variant: {
  //                 ...variant,
  //                 price: Intl.NumberFormat('en-DE').format(variant.price)
  //               }
  //             }
  //           }
  //         }),
  //         totalAmount: Intl.NumberFormat('en-DE').format(order.totalAmount)
  //       }
  //     })
  //     await session.commitTransaction()
  //     return new SuccessResponse(true)
  //   } catch (error) {
  //     await session.abortTransaction()
  //     console.error(error)
  //     throw error
  //   }
  // }

  // public async completeOrder(orderId: string, userId: string, role: UserRole, session?: ClientSession) {
  //   // 1. Update order status and order history
  //   const orderHistory = new OrderHistoryDto(OrderStatus.COMPLETED, TransactionStatus.CAPTURED, userId, role)
  //   const order = await this.orderRepository.findOneAndUpdate(
  //     {
  //       _id: orderId,
  //       orderStatus: OrderStatus.DELIVERING,
  //       transactionStatus: TransactionStatus.CAPTURED
  //     },
  //     {
  //       $set: { orderStatus: OrderStatus.COMPLETED, completeDate: new Date() },
  //       $push: { orderHistory }
  //     },
  //     {
  //       projection: '+items',
  //       session
  //     }
  //   )
  //   if (!order) throw new AppException(Errors.ORDER_STATUS_INVALID)

  //   return order
  // }
}
