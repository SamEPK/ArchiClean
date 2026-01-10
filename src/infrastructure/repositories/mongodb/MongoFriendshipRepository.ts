import mongoose, { Schema, Document } from 'mongoose';
import { Friendship, FriendshipStatus } from '@domain/entities/Friendship';
import { IFriendshipRepository } from '@domain/repositories/IFriendshipRepository';

interface FriendshipDocument extends Document {
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: Date;
  updatedAt?: Date;
}

const FriendshipSchema = new Schema<FriendshipDocument>({
  requesterId: { type: String, required: true },
  addresseeId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'blocked'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

export class MongoFriendshipRepository implements IFriendshipRepository {
  private get model() {
    if (mongoose.models.Friendship) {
      return mongoose.models.Friendship as mongoose.Model<FriendshipDocument>;
    }
    return mongoose.model<FriendshipDocument>('Friendship', FriendshipSchema);
  }

  private toEntity(doc: FriendshipDocument): Friendship {
    return new Friendship({
      id: doc._id.toString(),
      requesterId: doc.requesterId,
      addresseeId: doc.addresseeId,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async create(friendship: Friendship): Promise<void> {
    const doc = new this.model({
      _id: friendship.id,
      requesterId: friendship.requesterId,
      addresseeId: friendship.addresseeId,
      status: friendship.status,
      createdAt: friendship.createdAt,
      updatedAt: friendship.updatedAt,
    });
    await doc.save();
  }

  async findById(id: string): Promise<Friendship | null> {
    const doc = await this.model.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByUsers(userId1: string, userId2: string): Promise<Friendship | null> {
    const doc = await this.model.findOne({
      $or: [
        { requesterId: userId1, addresseeId: userId2 },
        { requesterId: userId2, addresseeId: userId1 },
      ],
    });
    return doc ? this.toEntity(doc) : null;
  }

  async findByUserAndStatus(userId: string, status: FriendshipStatus): Promise<Friendship[]> {
    const docs = await this.model.find({
      status,
      $or: [{ requesterId: userId }, { addresseeId: userId }],
    });
    return docs.map((doc) => this.toEntity(doc));
  }

  async findFriendsList(userId: string): Promise<Friendship[]> {
    const docs = await this.model.find({
      status: 'accepted',
      $or: [{ requesterId: userId }, { addresseeId: userId }],
    });
    return docs.map((doc) => this.toEntity(doc));
  }

  async findPendingRequests(userId: string): Promise<Friendship[]> {
    const docs = await this.model.find({ addresseeId: userId, status: 'pending' });
    return docs.map((doc) => this.toEntity(doc));
  }

  async update(friendship: Friendship): Promise<void> {
    await this.model.findByIdAndUpdate(friendship.id, {
      status: friendship.status,
      updatedAt: friendship.updatedAt ?? new Date(),
    });
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }

  async findAll(): Promise<Friendship[]> {
    const docs = await this.model.find();
    return docs.map((doc) => this.toEntity(doc));
  }
}
