import { Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PaymentController } from '@payment/controllers/payment.controller'
import { Payment, PaymentSchema } from '@payment/schemas/payment.schema'
import { PaymentService } from '@payment/services/payment.service'
import { PaymentRepository } from '@payment/repositories/payment.repository'
import { HttpModule } from '@nestjs/axios'
import { ZaloPayPaymentStrategy } from '@payment/strategies/zalopay.strategy'
import { MomoPaymentStrategy } from '@payment/strategies/momo.strategy'
import { OrderModule } from '@order/order.module'
import { ProductModule } from '@product/product.module'
import { CustomerModule } from '@customer/customer.module'
import { CourseModule } from '@course/course.module'

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    HttpModule,
    OrderModule,
    CustomerModule,
    ProductModule,
    CourseModule
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository, ZaloPayPaymentStrategy, MomoPaymentStrategy],
  exports: [PaymentService, PaymentRepository]
})
export class PaymentModule {}
