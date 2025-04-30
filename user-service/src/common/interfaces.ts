import { Types } from 'mongoose';

export interface User extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  createdAt: Date;
}

export interface UserAttributes {
  id: Types.ObjectId;
  name: string;
  email: string;
  createdAt: Date;
}
