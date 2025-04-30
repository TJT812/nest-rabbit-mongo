import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserAttributes } from '../../common/interfaces';
import {
  CreateUserDto,
  GetUsersDto,
  getUsersResponse,
  UpdateUserDto,
  UserIdDto,
} from './dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async findAll(@Query() query: GetUsersDto): Promise<getUsersResponse> {
    const { limit, page } = query;
    const result = await this.userService.findAll({ limit, page });
    return result;
  }

  @Get(':id')
  async findOne(@Param() params: UserIdDto): Promise<UserAttributes> {
    const { id } = params;
    const user = await this.userService.findOne(id);
    return user;
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<UserAttributes> {
    return this.userService.create(createUserDto);
  }

  @Put(':id')
  update(
    @Param() params: UserIdDto,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserAttributes> {
    const { id } = params;
    return this.userService.update({ id, ...updateUserDto });
  }

  @Delete(':id')
  remove(@Param() params: UserIdDto): Promise<UserAttributes> {
    const { id } = params;
    return this.userService.remove(id);
  }
}
