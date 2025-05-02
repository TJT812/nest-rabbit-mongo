import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { utils } from '../../common/utils';
import { ClientProxy, ClientsModule } from '@nestjs/microservices';
import { servicesEnum } from '../../common/enums';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly connection: any,
    @Inject(servicesEnum.NOTIFICATION_SERVICE)
    private notificationService: ClientProxy,
  ) {}

  @Get()
  getHealth() {
    if (this.connection.readyState === 1) {
      return { status: 'ok' };
    }
  }

  @Get('/notification-service')
  async getNotificationServiceHealth() {
    const isHealthy = await utils.observe(
      this.notificationService.send({ cmd: 'health' }, { message: 'check' }),
    );
    if (isHealthy) {
      return { status: 'ok' };
    } else {
      throw new ServiceUnavailableException(
        'Notification service is not available',
      );
    }
  }
}
