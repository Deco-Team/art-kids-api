import { Global, Module } from '@nestjs/common'
import { JwtAccessStrategy } from '@auth/strategies/jwt-access.strategy'
import { PassportModule } from '@nestjs/passport'
import { CustomerModule } from '@customer/customer.module'
import { AuthService } from '@auth/services/auth.service'
import { AuthCustomerController } from '@auth/controllers/customer.controller'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import { JwtRefreshStrategy } from '@auth/strategies/jwt-refresh.strategy'
import { StaffModule } from '@staff/staff.module'
import { AuthAdminController } from '@auth/controllers/admin.controller'
import { ProviderModule } from '@provider/provider.module'
import { AdminModule } from '@admin/admin.module'
import { AuthProviderController } from '@auth/controllers/provider.controller'
import { TokenModule } from '@token/token.module'

@Global()
@Module({
  imports: [
    ConfigModule,
    CustomerModule,
    ProviderModule,
    AdminModule,
    StaffModule,
    PassportModule,
    JwtModule,
    TokenModule
  ],
  controllers: [AuthCustomerController, AuthProviderController, AuthAdminController],
  providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy],
  exports: [AuthService]
})
export class AuthModule {}
