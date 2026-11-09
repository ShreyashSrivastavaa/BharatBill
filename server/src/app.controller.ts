import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

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

  @Public()
  @Get('ready')
  async readinessCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        database: 'disconnected',
        error: err.message,
      });
    }
  }
}

