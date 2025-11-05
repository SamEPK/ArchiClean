import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import { toUserEntity, toUserDocument } from './UserModel';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel('User') private readonly userModel: Model<any>,
  ) {}

  async create(user: User): Promise<User> {
    const userDoc = toUserDocument(user);
    const created = await this.userModel.create(userDoc);
    return toUserEntity(created);
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.userModel.findById(id);
    return doc ? toUserEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ email: email.toLowerCase() });
    return doc ? toUserEntity(doc) : null;
  }

  async findByEmailConfirmationToken(token: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ emailConfirmationToken: token });
    return doc ? toUserEntity(doc) : null;
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ refreshToken });
    return doc ? toUserEntity(doc) : null;
  }

  async update(user: User): Promise<User> {
    const userDoc = toUserDocument(user);
    const updated = await this.userModel.findByIdAndUpdate(
      user.id,
      { $set: userDoc },
      { new: true }
    );
    
    if (!updated) {
      throw new Error(`User with id ${user.id} not found`);
    }
    
    return toUserEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id);
  }

  async findAll(skip: number = 0, limit: number = 20): Promise<User[]> {
    const docs = await this.userModel.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    return docs.map(toUserEntity);
  }

  async count(): Promise<number> {
    return await this.userModel.countDocuments();
  }

  async searchByName(query: string, skip: number = 0, limit: number = 20): Promise<User[]> {
    const docs = await this.userModel.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
      ],
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    return docs.map(toUserEntity);
  }

  async findPublicProfiles(skip: number = 0, limit: number = 20): Promise<User[]> {
    const docs = await this.userModel.find({ isPublic: true })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    return docs.map(toUserEntity);
  }
}
