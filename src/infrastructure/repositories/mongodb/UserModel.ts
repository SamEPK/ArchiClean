import { Schema, model } from 'mongoose';
import { User, UserRole } from '../../../domain/entities/User';

const UserSchema = new Schema({
  _id: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
  avatar: { type: String },
  bio: { type: String },
  isPublic: { type: Boolean, default: false },
  isEmailConfirmed: { type: Boolean, default: false },
  emailConfirmationToken: { type: String },
  emailConfirmationTokenExpiry: { type: Date },
  refreshToken: { type: String },
  lastLoginAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

// Index pour améliorer les performances de recherche
UserSchema.index({ email: 1 });
UserSchema.index({ emailConfirmationToken: 1 });
UserSchema.index({ refreshToken: 1 });
UserSchema.index({ isPublic: 1 });
UserSchema.index({ firstName: 'text', lastName: 'text' });

export { UserSchema };
export const UserModel = model('User', UserSchema);

export function toUserEntity(doc: any): User {
  return new User({
    id: doc._id,
    email: doc.email,
    password: doc.password,
    firstName: doc.firstName,
    lastName: doc.lastName,
    phoneNumber: doc.phoneNumber,
    role: doc.role,
    avatar: doc.avatar,
    bio: doc.bio,
    isPublic: doc.isPublic,
    isEmailConfirmed: doc.isEmailConfirmed,
    emailConfirmationToken: doc.emailConfirmationToken,
    emailConfirmationTokenExpiry: doc.emailConfirmationTokenExpiry,
    refreshToken: doc.refreshToken,
    lastLoginAt: doc.lastLoginAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
}

export function toUserDocument(user: User) {
  return {
    _id: user.id,
    email: user.email,
    password: user.password,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    isPublic: user.isPublic,
    isEmailConfirmed: user.isEmailConfirmed,
    emailConfirmationToken: user.emailConfirmationToken,
    emailConfirmationTokenExpiry: user.emailConfirmationTokenExpiry,
    refreshToken: user.refreshToken,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
