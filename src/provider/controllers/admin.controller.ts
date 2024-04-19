import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { DataResponse } from '@common/contracts/openapi-builder'
import { Sides } from '@auth/decorators/sides.decorator'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { SidesGuard } from '@auth/guards/sides.guard'
import { UserSide } from '@common/contracts/constant'
import { ProviderService } from '@provider/services/provider.service'
import { CreateProviderDto, ProviderDto, ProviderPaginateDto } from '@provider/dto/provider.dto'
import { PaginationQuery } from '@common/contracts/dto'
import { Pagination, PaginationParams } from '@common/decorators/pagination.decorator'
import { ParseObjectIdPipe } from '@common/pipes/parse-object-id.pipe'

@ApiTags('Provider - Admin')
@ApiBearerAuth()
@Sides(UserSide.ADMIN)
@UseGuards(JwtAuthGuard.ACCESS_TOKEN, SidesGuard)
@Controller('admin')
export class AdminProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Get()
  @ApiOkResponse({ type: DataResponse(ProviderPaginateDto) })
  @ApiQuery({ type: PaginationQuery })
  getProviders(@Pagination() paginationParams: PaginationParams) {
    const filter = {}

    return this.providerService.getProvidersByAdmin(filter, paginationParams)
  }

  @Get(':id')
  @ApiOkResponse({ type: DataResponse(ProviderDto) })
  @ApiParam({ name: 'id' })
  getCourseDetails(@Param('id', ParseObjectIdPipe) id: string) {

    return this.providerService.getProviderDetailByAdmin(id)
  }

  @Post()
  @ApiCreatedResponse({ type: DataResponse(ProviderDto) })
  createProduct(@Body() createProviderDto: CreateProviderDto) {
    return this.providerService.createProvider(createProviderDto)
  }
}
