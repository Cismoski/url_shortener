import { Module } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { RedirectController } from './redirect.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UrlController, RedirectController],
  providers: [UrlService],
})
export class UrlModule {}
