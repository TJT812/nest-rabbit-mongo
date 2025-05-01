import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { UserAttributes } from '../../common/interfaces';
import { User, userModelName } from '../../db/schemas/user.schema';
import { CreateUserDto, getUsersResponse, UserIdDto } from './dto/user.dto';
import { utils } from '../../common/utils';
import { servicesEnum } from '../../common/enums';
import { ClientProxy } from '@nestjs/microservices';
import { userEventTypes } from 'apps/notification-service/src/common/enums';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(userModelName) private users: Model<UserAttributes>,
    @InjectConnection() private connection: Connection,
    @Inject(servicesEnum.NOTIFICATION_SERVICE)
    private notificationService: ClientProxy,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserAttributes> {
    const { name, email } = createUserDto;

    const normalizedEmail = utils.normalizeEmail(email);
    const user = await this.findByEmail(normalizedEmail);
    if (user) {
      throw new BadRequestException(`User with this email already exists`);
    }

    const newUser = await this.users.insertOne({
      name,
      email: normalizedEmail,
    });

    console.log('Message sent to notification service');

    let notificationResult = false;
    try {
      notificationResult = await utils.observe(
        this.notificationService.send(
          { cmd: userEventTypes.USER_CREATED },
          { name, email: normalizedEmail },
        ),
      );
    } catch (err) {
      if (newUser) {
        await this.users.findByIdAndDelete(newUser._id);
      }
      throw err;
    }

    console.log('Result from notification service', notificationResult);
    return newUser;
  }

  async findAll({ page = 1, limit = 100 }): Promise<getUsersResponse> {
    const users = await this.users
      .find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const usersFormatted = users.map((user) => user);
    const count = await this.users.countDocuments({}, { limit: 10000 });

    return {
      users: usersFormatted,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  }

  async findOne(id: string): Promise<UserAttributes> {
    const user = await this.users.findById(id);

    if (!user) {
      throw new NotFoundException(`User is not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<{ _id: Types.ObjectId } | null> {
    const user = await this.users.exists({ email });
    return user;
  }

  async update({
    id,
    name,
    email,
  }: {
    id: string;
    name: string;
    email: string;
  }): Promise<UserAttributes> {
    const normalizedEmail = utils.normalizeEmail(email);
    const user = await this.findByEmail(normalizedEmail);
    if (user) {
      throw new BadRequestException(`User with this email already exists`);
    }

    const updatedUser = await this.users.findByIdAndUpdate(id, { name, email });

    if (!updatedUser) {
      throw new NotFoundException(`User is not found`);
    }
    return updatedUser;
  }

  async remove(id: string): Promise<UserIdDto> {
    const user = await this.users.findByIdAndUpdate(id, {
      deletedAt: new Date(),
    });

    if (!user) {
      throw new NotFoundException(`User is not found`);
    }

    console.log('Message sent to notification service');

    let notificationResult = false;
    try {
      notificationResult = await utils.observe(
        this.notificationService.send(
          { cmd: userEventTypes.USER_DELETED },
          { name: user.name, email: user.email },
        ),
      );
    } catch (err) {
      await this.users.findByIdAndUpdate(id, {
        deletedAt: null,
      });
      throw err;
    }
    await this.users.deleteOne({ _id: id });

    return { id };
  }

  private formatUser(user: User): UserAttributes {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
