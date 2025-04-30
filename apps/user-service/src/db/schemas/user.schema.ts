import mongoose, { Types } from 'mongoose';

export interface User extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  createdAt: Date;
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  {
    timestamps: { createdAt: 'created_at' },
    collection: 'users',
    autoCreate: true,
  },
);

const userModelName = 'User';

export { userSchema, userModelName };
