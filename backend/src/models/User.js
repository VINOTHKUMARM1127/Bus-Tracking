import mongoose from 'mongoose';

export const USER_ROLES = {
  admin: 'admin',
  driver: 'driver'
};

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(USER_ROLES), required: true },
    busNumber: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', UserSchema);



