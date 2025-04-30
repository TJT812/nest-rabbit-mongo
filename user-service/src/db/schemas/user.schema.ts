import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  { timestamps: { createdAt: 'created_at' } },
);

const userModelName = 'User';
const userConnectionName = 'users';

export { userSchema, userModelName, userConnectionName };
