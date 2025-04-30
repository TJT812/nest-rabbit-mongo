import { isValidObjectId } from 'mongoose';
import { createZodDto } from 'nestjs-zod';
import { UserAttributes } from 'src/common/interfaces';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email('Invalid email format'),
});

const getUsersSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  page: z.coerce.number().int().min(1).optional(),
});

const userIdSchema = z.object({
  id: z.string().refine(isValidObjectId),
});

interface getUsersResponse {
  users: UserAttributes[];
  totalPages: number;
  currentPage: number;
}

class CreateUserDto extends createZodDto(createUserSchema) {}
class UpdateUserDto extends createZodDto(createUserSchema) {}
class GetUsersDto extends createZodDto(getUsersSchema) {}
class UserIdDto extends createZodDto(userIdSchema) {}

export {
  CreateUserDto,
  UpdateUserDto,
  GetUsersDto,
  UserIdDto,
  getUsersResponse,
};
