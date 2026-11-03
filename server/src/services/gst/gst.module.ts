import { Global, Module } from '@nestjs/common';
import { GstService } from './gst.service';

@Global()
@Module({
  providers: [GstService],
  exports: [GstService],
})
export class GstModule {}

