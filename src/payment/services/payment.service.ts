import { Injectable, Logger } from '@nestjs/common'
import { IPaymentStrategy } from '@payment/strategies/payment-strategy.interface'
import {
  CreateMomoPaymentDto,
  MomoPaymentResponseDto,
  QueryMomoPaymentDto,
  RefundMomoPaymentDto
} from '@payment/dto/momo-payment.dto'
import { MomoPaymentStrategy } from '@payment/strategies/momo.strategy'
import { InjectConnection } from '@nestjs/mongoose'
import { Connection, FilterQuery, Types } from 'mongoose'
import { OrderRepository } from '@order/repositories/order.repository'
import { PaymentRepository } from '@payment/repositories/payment.repository'
import { AppException } from '@common/exceptions/app.exception'
import { Errors } from '@common/contracts/error'
import { CourseStatus, OrderStatus, TransactionStatus } from '@common/contracts/constant'
import { MomoResultCode } from '@payment/contracts/constant'
import { PaginationParams } from '@common/decorators/pagination.decorator'
import { Payment } from '@payment/schemas/payment.schema'
import { MailerService } from '@nestjs-modules/mailer'
import { CustomerRepository } from '@customer/repositories/customer.repository'
import { CourseRepository } from '@course/repositories/course.repository'
import { CustomerCourseRepository } from '@course/repositories/customer-course.repository'

@Injectable()
export class PaymentService {
  private strategy: IPaymentStrategy
  private readonly logger = new Logger(PaymentService.name)
  constructor(
    @InjectConnection() readonly connection: Connection,
    private readonly orderRepository: OrderRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly courseRepository: CourseRepository,
    private readonly customerCourseRepository: CustomerCourseRepository,
    private readonly paymentRepository: PaymentRepository,
    readonly momoPaymentStrategy: MomoPaymentStrategy,
    private readonly mailerService: MailerService
  ) {}

  public setStrategy(strategy: IPaymentStrategy) {
    this.strategy = strategy
  }

  public createTransaction(createPaymentDto: CreateMomoPaymentDto) {
    return this.strategy.createTransaction(createPaymentDto)
  }

  public getTransaction(queryPaymentDto: QueryMomoPaymentDto) {
    return this.strategy.getTransaction(queryPaymentDto)
  }

  public refundTransaction(refundPaymentDto: RefundMomoPaymentDto) {
    return this.strategy.refundTransaction(refundPaymentDto)
  }

  public getRefundTransaction(queryPaymentDto: QueryMomoPaymentDto) {
    return this.strategy.getRefundTransaction(queryPaymentDto)
  }

  public async getPaymentList(filter: FilterQuery<Payment>, paginationParams: PaginationParams) {
    const result = await this.paymentRepository.paginate(
      {
        ...filter,
        transactionStatus: {
          $in: [TransactionStatus.CAPTURED]
        }
      },
      {
        projection: '-transactionHistory',
        ...paginationParams
      }
    )
    return result
  }

  public async processWebhook(momoPaymentResponseDto: MomoPaymentResponseDto) {
    this.logger.log('processWebhook: momoPaymentResponseDto', JSON.stringify(momoPaymentResponseDto))
    // Execute in transaction
    const session = await this.connection.startSession()
    session.startTransaction()
    try {
      // 1. Get order from orderId
      const order = await this.orderRepository.findOne({
        conditions: {
          orderNumber: momoPaymentResponseDto.orderId
        },
        projection: '+items'
      })
      if (!order) throw new AppException(Errors.ORDER_NOT_FOUND)
      this.logger.log('processWebhook: order', JSON.stringify(order))

      if (momoPaymentResponseDto.resultCode === MomoResultCode.SUCCESS) {
        this.logger.log('processWebhook: resultCode SUCCESS', momoPaymentResponseDto.resultCode)
        // Payment success
        // 1. Update order transactionStatus
        await this.orderRepository.findOneAndUpdate(
          {
            _id: order._id
          },
          {
            $set: {
              orderStatus: OrderStatus.COMPLETED,
              transactionStatus: TransactionStatus.CAPTURED,
              'payment.transactionStatus': TransactionStatus.CAPTURED,
              'payment.transaction': momoPaymentResponseDto
            }
          },
          {
            session
          }
        )

        // 2. Update payment transactionStatus, transaction
        await this.paymentRepository.findOneAndUpdate(
          {
            _id: order.payment._id
          },
          {
            $set: {
              transactionStatus: TransactionStatus.CAPTURED,
              transaction: momoPaymentResponseDto
            }
          },
          {
            session
          }
        )

        const courseIds = order.items.map((item) => new Types.ObjectId(item.course))
        const courses = await this.courseRepository.findMany({
          conditions: {
            _id: {
              $in: courseIds
            },
            status: CourseStatus.PUBLISHED
          }
        })

        // 5. Create customer courses
        const customerCourses = []
        courses.forEach((course) => {
          customerCourses.push({
            customer: order.customer,
            course: {
              ...course.toJSON(),
              lessons: course.toJSON().lessons.map((lesson) => {
                return { ...lesson, isCompleted: false }
              })
            }
          })
        })
        await this.customerCourseRepository.model.insertMany(customerCourses, {
          session
        })

        // 9. Send email/notification to customer
        const customer = await this.customerRepository.findOne({
          conditions: {
            _id: order.customer
          }
        })
        await this.mailerService.sendMail({
          to: customer.email,
          subject: `[ArtKids] Đã thanh toán đơn hàng #${order.orderNumber}`,
          template: 'order-created',
          context: {
            ...order.toJSON(),
            _id: order._id,
            orderId: order.orderNumber,
            customer: customer,
            items: courses,
            totalAmount: Intl.NumberFormat('en-DE').format(order.totalAmount)
          }
        })
        // 10. Send notification to staff
      } else {
        // Payment failed
        this.logger.log('processWebhook: resultCode FAILED', momoPaymentResponseDto.resultCode)
        // 1. Update order transactionStatus
        await this.orderRepository.findOneAndUpdate(
          {
            _id: order._id
          },
          {
            $set: {
              orderStatus: OrderStatus.PENDING,
              transactionStatus: TransactionStatus.ERROR,
              'payment.transactionStatus': TransactionStatus.ERROR,
              'payment.transaction': momoPaymentResponseDto,
              'payment.transactionHistory': [momoPaymentResponseDto]
            }
          },
          {
            session
          }
        )

        // 2.  Update payment transactionStatus, transaction
        await this.paymentRepository.findOneAndUpdate(
          {
            _id: order.payment._id
          },
          {
            $set: {
              transactionStatus: TransactionStatus.ERROR,
              transaction: momoPaymentResponseDto
            }
          },
          {
            session
          }
        )
      }
      await session.commitTransaction()
      this.logger.log('processWebhook: SUCCESS!!!')
      return true
    } catch (error) {
      await session.abortTransaction()
      this.logger.error('processWebhook: catch', JSON.stringify(error))
      throw error
    }
  }
}
