import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import { DataResponse } from '@common/contracts/openapi-builder'
import { Sides } from '@auth/decorators/sides.decorator'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { SidesGuard } from '@auth/guards/sides.guard'
import { UserSide } from '@common/contracts/constant'
import { ProviderService } from '@provider/services/provider.service'
import { CreateProviderDto, ProviderDto } from '@provider/dto/provider.dto'

@ApiTags('Provider - Admin')
@ApiBearerAuth()
@Sides(UserSide.ADMIN)
@UseGuards(JwtAuthGuard.ACCESS_TOKEN, SidesGuard)
@Controller('admin')
export class AdminProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post()
  @ApiCreatedResponse({ type: DataResponse(ProviderDto) })
  createProduct(@Body() createProviderDto: CreateProviderDto) {
    return this.providerService.createProvider(createProviderDto)
  }
}
