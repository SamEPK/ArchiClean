import mongoose, { Schema, Document } from 'mongoose';
import { PrivateMessage } from '@domain/entities/PrivateMessage';
import { IPrivateMessageRepository } from '@domain/repositories/IPrivateMessageRepository';

interface PrivateMessageDocument extends Document {
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

const PrivateMessageSchema = new Schema<PrivateMessageDocument>({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

export class MongoPrivateMessageRepository implements IPrivateMessageRepository {
  private get model() {
    // Lazy model initialization to avoid blocking on module load
    if (mongoose.models.PrivateMessage) {
      return mongoose.models.PrivateMessage as mongoose.Model<PrivateMessageDocument>;
    }
    return mongoose.model<PrivateMessageDocument>('PrivateMessage', PrivateMessageSchema);
  }

  private toEntity(doc: PrivateMessageDocument): PrivateMessage {
    return new PrivateMessage({
      id: doc._id.toString(),
      senderId: doc.senderId,
      receiverId: doc.receiverId,
      content: doc.content,
      isRead: doc.isRead,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async create(message: PrivateMessage): Promise<void> {
    const doc = new this.model({
      _id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    });
    await doc.save();
  }

  async findById(id: string): Promise<PrivateMessage | null> {
    const doc = await this.model.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findConversation(userId1: string, userId2: string, limit = 50): Promise<PrivateMessage[]> {
    const docs = await this.model.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    return docs.map((doc) => this.toEntity(doc));
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.model.findByIdAndUpdate(messageId, {
      isRead: true,
      updatedAt: new Date(),
    });
  }

  async countUnreadMessages(userId: string): Promise<number> {
    return this.model.countDocuments({ receiverId: userId, isRead: false });
  }

  async findAll(): Promise<PrivateMessage[]> {
    const docs = await this.model.find();
    return docs.map((doc) => this.toEntity(doc));
  }
}
