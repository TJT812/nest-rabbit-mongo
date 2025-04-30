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
import { CreateUserDto, getUsersResponse } from './dto/user.dto';
import { utils } from '../../common/utils';
import { servicesEnum } from '../../common/enums';
import { ClientProxy } from '@nestjs/microservices';

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

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const newUser = await this.users.insertOne({
        name,
        email: normalizedEmail,
      });

      this.notificationService.send(
        { cmd: 'user.created' },
        { name: newUser.name, email: newUser.email },
      );

      await session.commitTransaction();
      return newUser;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    }
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

  async remove(id: string): Promise<UserAttributes> {
    const deletedUser = await this.users.findByIdAndDelete(id);

    if (!deletedUser) {
      throw new NotFoundException(`User is not found`);
    }
    return deletedUser;
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
