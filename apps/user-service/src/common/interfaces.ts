import { Types } from 'mongoose';
export interface UserAttributes {
  id: Types.ObjectId;
  name: string;
  email: string;
  createdAt: Date;
}
