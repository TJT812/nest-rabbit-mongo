import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: any) {}

  @Get()
  getHealth() {
    if (this.connection.readyState === 1) {
      return { status: 'ok' };
    }
  }
}
