import { Injectable } from '@nestjs/common';
import { Ctx, Payload, RmqContext } from '@nestjs/microservices';
import { UserPayload } from './common/interfaces';

@Injectable()
export class NotificationServiceService {
  onUserCreated(data: UserPayload): void {
    console.log(`Hello, ${data.name}, notification was sent to ${data.email}`);
  }

  onUserDeleted(data: UserPayload): void {
    console.log(`Cheers, ${data.name}, notification was sent to ${data.email}`);
  }
}
