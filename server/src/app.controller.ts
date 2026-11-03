import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get('health')
  healthCheck() {
    return {
      status: 'healthy',
      app: 'BharatBill API',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    };
  }
}
