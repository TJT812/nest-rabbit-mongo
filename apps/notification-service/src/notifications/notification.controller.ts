import { Controller, Get, UseFilters } from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { userEventTypes } from '../common/enums';
import { UserPayload } from '../common/interfaces';
import { ExceptionFilter } from '../exception-filters/rpc-exceptioin.filter';

@Controller()
export class NotificationServiceController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseFilters(new ExceptionFilter())
  @MessagePattern({ cmd: userEventTypes.USER_CREATED })
  onUserCreated(@Payload() data: UserPayload, @Ctx() context: RmqContext) {
    this.notificationService.onUserCreated(data);
    this.ack(context);
    return true;
  }

  @UseFilters(new ExceptionFilter())
  @MessagePattern({ cmd: userEventTypes.USER_DELETED })
  onUserDeleted(@Payload() data: UserPayload, @Ctx() context: RmqContext) {
    this.notificationService.onUserDeleted(data);
    this.ack(context);
    return true;
  }

  ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
}
