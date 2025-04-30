import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserAttributes } from 'src/common/interfaces';
import { userConnectionName, userModelName } from 'src/db/schemas/user.schema';
import { CreateUserDto, getUsersResponse } from './dto/user.dto';
import { utils } from 'src/common/utils';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(userModelName, userConnectionName) private users: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { name, email } = createUserDto;

    const normalizedEmail = utils.normalizeEmail(email);
    const user = await this.findByEmail(normalizedEmail);
    if (user) {
      throw new BadRequestException(`User with this email already exists`);
    }

    const newUser = this.users.insertOne({ name, email: normalizedEmail });
    return newUser;
  }

  async findAll({ page = 1, limit = 100 }): Promise<getUsersResponse> {
    const users = await this.users
      .find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const usersFormatted = users.map((user) => this.formatUser(user));
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
    return this.formatUser(user);
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
    return this.formatUser(updatedUser);
  }

  async remove(id: string): Promise<UserAttributes> {
    const deletedUser = await this.users.findByIdAndDelete(id);

    if (!deletedUser) {
      throw new NotFoundException(`User is not found`);
    }
    return this.formatUser(deletedUser);
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
