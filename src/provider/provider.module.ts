import { ProviderService } from './services/provider.service';
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Provider, ProviderSchema } from '@provider/schemas/provider.schema'
import { ProviderRepository } from '@provider/repositories/provider.repository'
import { AdminProviderController } from './controllers/admin.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Provider.name, schema: ProviderSchema }])],
  controllers: [AdminProviderController],
  providers: [ProviderService, ProviderRepository],
  exports: [ProviderRepository]
})
export class ProviderModule {}
