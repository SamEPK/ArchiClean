import mongoose, { Schema, Document } from 'mongoose';
import { GroupMessage } from '@domain/entities/GroupMessage';
import { IGroupMessageRepository } from '@domain/repositories/IGroupMessageRepository';

interface GroupMessageDocument extends Document {
  groupId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

const GroupMessageSchema = new Schema<GroupMessageDocument>({
  groupId: { type: String, required: true },
  senderId: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

export class MongoGroupMessageRepository implements IGroupMessageRepository {
  private get model() {
    if (mongoose.models.GroupMessage) {
      return mongoose.models.GroupMessage as mongoose.Model<GroupMessageDocument>;
    }
    return mongoose.model<GroupMessageDocument>('GroupMessage', GroupMessageSchema);
  }

  private toEntity(doc: GroupMessageDocument): GroupMessage {
    return new GroupMessage({
      id: doc._id.toString(),
      groupId: doc.groupId,
      senderId: doc.senderId,
      content: doc.content,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async create(message: GroupMessage): Promise<void> {
    const doc = new this.model({
      _id: message.id,
      groupId: message.groupId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    });
    await doc.save();
  }

  async findById(id: string): Promise<GroupMessage | null> {
    const doc = await this.model.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByGroupId(groupId: string, limit = 100): Promise<GroupMessage[]> {
    const docs = await this.model.find({ groupId })
      .sort({ createdAt: -1 })
      .limit(limit);
    return docs.map((doc) => this.toEntity(doc));
  }

  async findAll(): Promise<GroupMessage[]> {
    const docs = await this.model.find();
    return docs.map((doc) => this.toEntity(doc));
  }
}
