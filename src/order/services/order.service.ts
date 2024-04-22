import { Injectable, Logger } from '@nestjs/common'
import { OrderRepository } from '@order/repositories/order.repository'
import { PaginationParams } from '@common/decorators/pagination.decorator'
import { CourseStatus, OrderStatus, TransactionStatus, UserRole } from '@common/contracts/constant'
import { CancelOrderDto, CreateOrderDto } from '@order/dto/order.dto'
import { ClientSession, Connection, FilterQuery, PopulateOptions, Types } from 'mongoose'
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

  public async getOrderListByCustomer(filter: FilterQuery<Order>, paginationParams: PaginationParams) {
    const result = await this.orderRepository.paginate(
      {
        ...filter
        // transactionStatus: TransactionStatus.CAPTURED,
        // status: OrderStatus.COMPLETED
      },
      {
        ...paginationParams,
        populate: [
          {
            path: 'items',
            populate: { path: 'course', model: 'Course', select: '-lessons' }
          }
        ]
      }
    )
    return result
  }

  public async getOrderDetailByCustomer(filter: FilterQuery<Order>) {
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

  public async getOrderListByAdmin(filter: FilterQuery<Order>, paginationParams: PaginationParams) {
    const result = await this.orderRepository.paginate(
      {
        ...filter
        // transactionStatus: TransactionStatus.CAPTURED,
        // status: OrderStatus.COMPLETED
      },
      {
        ...paginationParams,
        populate: [
          {
            path: 'customer'
          },
          {
            path: 'items',
            populate: { path: 'course', model: 'Course', select: '-lessons' }
          }
        ]
      }
    )
    return result
  }

  public async getOrderDetailByAdmin(filter: FilterQuery<Order>) {
    const order = await this.orderRepository.findOne({
      conditions: {
        ...filter
        // transactionStatus: TransactionStatus.CAPTURED,
        // status: OrderStatus.COMPLETED
      },
      populates: [
        {
          path: 'customer'
        },
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
      courses.forEach((course) => {
        totalAmount += course.price
        orderItems.push({ course: course._id, price: course.price })
      })

      // 3. Process transaction
      let createMomoPaymentResponse: CreateMomoPaymentResponse
      createOrderDto['paymentMethod'] = PaymentMethod.MOMO
      switch (createOrderDto['paymentMethod']) {
        // case PaymentMethod.ZALO_PAY:
        // // implement later
        case PaymentMethod.MOMO:
        default:
          this.paymentService.setStrategy(this.paymentService.momoPaymentStrategy)
          console.log(`${this.configService.get('SERVER_URL')}/payment/webhook`)
          console.log(`${this.configService.get('WEB_URL')}/order-status`)
          const createMomoPaymentDto: CreateMomoPaymentDto = {
            partnerName: 'ARTKIDS',
            orderInfo: `ArtKids - Thanh toán đơn hàng #${orderNumber}`,
            redirectUrl: `${this.configService.get('WEB_URL')}/order-status`,
            ipnUrl: `${this.configService.get('SERVER_URL')}/payment/webhook`,
            requestType: 'captureWallet',
            amount: totalAmount,
            orderId: orderNumber,
            requestId: orderNumber,
            extraData: '',
            autoCapture: true,
            lang: 'vi',
            orderExpireTime: 15
          }
          createMomoPaymentResponse = await this.paymentService.createTransaction(createMomoPaymentDto)
          break
      }

      // 4. Create payment
      const payment = await this.paymentRepository.create(
        {
          transactionStatus: TransactionStatus.DRAFT,
          transaction: createMomoPaymentResponse,
          paymentMethod: createOrderDto['paymentMethod'],
          amount: totalAmount
        },
        {
          session
        }
      )

      // 5. Create order
      await this.orderRepository.create(
        {
          ...createOrderDto,
          orderNumber,
          items: orderItems,
          totalAmount,
          payment
        },
        {
          session
        }
      )

      await session.commitTransaction()
      return createMomoPaymentResponse
    } catch (error) {
      await session.abortTransaction()
      console.error(error)
      throw error
    }
  }
}
