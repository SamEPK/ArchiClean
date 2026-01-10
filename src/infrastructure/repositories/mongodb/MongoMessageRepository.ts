import mongoose, { Schema, Document } from 'mongoose';
import { IMessageRepository } from '@domain/repositories/IMessageRepository';
import { Message } from '@domain/entities/Message';
import { Conversation } from '@domain/entities/Conversation';

interface MessageDocument extends Document {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface ConversationDocument extends Document {
  _id: string;
  clientId: string;
  advisorId?: string | null;
  status: 'open' | 'assigned' | 'closed';
  createdAt: Date;
  firstResponderId?: string | null;
  firstResponseAt?: Date | null;
}

const messageSchema = new Schema<MessageDocument>({
  _id: { type: String, required: true },
  conversationId: { type: String, required: true, index: true },
  senderId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now, index: true },
  isRead: { type: Boolean, required: true, default: false },
});

const conversationSchema = new Schema<ConversationDocument>({
  _id: { type: String, required: true },
  clientId: { type: String, required: true, index: true },
  advisorId: { type: String, required: false, default: null, index: true },
  status: { type: String, required: true, enum: ['open', 'assigned', 'closed'], default: 'open', index: true },
  createdAt: { type: Date, required: true, default: Date.now },
  firstResponderId: { type: String, required: false, default: null },
  firstResponseAt: { type: Date, required: false, default: null },
});

// Index composés pour recherches optimisées
messageSchema.index({ conversationId: 1, timestamp: -1 });
messageSchema.index({ senderId: 1, timestamp: -1 });
conversationSchema.index({ status: 1, createdAt: -1 });
conversationSchema.index({ advisorId: 1, status: 1 });

const MessageModel = mongoose.model<MessageDocument>('AdvisorMessage', messageSchema);
const ConversationModel = mongoose.model<ConversationDocument>('Conversation', conversationSchema);

export class MongoMessageRepository implements IMessageRepository {
  private toMessageEntity(doc: MessageDocument): Message {
    return new Message({
      id: doc._id,
      conversationId: doc.conversationId,
      senderId: doc.senderId,
      content: doc.content,
      timestamp: doc.timestamp,
      isRead: doc.isRead,
    });
  }

  private toConversationEntity(doc: ConversationDocument): Conversation {
    return new Conversation({
      id: doc._id,
      clientId: doc.clientId,
      advisorId: doc.advisorId,
      status: doc.status,
      createdAt: doc.createdAt,
      firstResponderId: doc.firstResponderId,
      firstResponseAt: doc.firstResponseAt,
    });
  }

  async saveMessage(message: Message): Promise<void> {
    const doc = new MessageModel({
      _id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      timestamp: message.timestamp,
      isRead: message.isRead,
    });
    await doc.save();
  }

  async listMessages(conversationId: string): Promise<Message[]> {
    const docs = await MessageModel.find({ conversationId }).sort({ timestamp: 1 });
    return docs.map(doc => this.toMessageEntity(doc));
  }

  async createConversation(conv: Conversation): Promise<void> {
    const doc = new ConversationModel({
      _id: conv.id,
      clientId: conv.clientId,
      advisorId: conv.advisorId,
      status: conv.status,
      createdAt: conv.createdAt,
      firstResponderId: conv.firstResponderId,
      firstResponseAt: conv.firstResponseAt,
    });
    await doc.save();
  }

  async findOpenConversations(): Promise<Conversation[]> {
    const docs = await ConversationModel.find({ status: 'open' }).sort({ createdAt: -1 });
    return docs.map(doc => this.toConversationEntity(doc));
  }

  async assignConversation(convId: string, advisorId: string): Promise<void> {
    await ConversationModel.updateOne(
      { _id: convId },
      {
        $set: {
          advisorId: advisorId,
          status: 'assigned',
        }
      }
    );
  }

  async transferConversation(convId: string, fromAdvisorId: string, toAdvisorId: string): Promise<void> {
    await ConversationModel.updateOne(
      { _id: convId, advisorId: fromAdvisorId },
      {
        $set: {
          advisorId: toAdvisorId,
        }
      }
    );
  }

  async findConversationById(convId: string): Promise<Conversation | null> {
    const doc = await ConversationModel.findById(convId);
    return doc ? this.toConversationEntity(doc) : null;
  }

  async markConversationAssignedByFirstResponder(convId: string, advisorId: string): Promise<void> {
    const conv = await ConversationModel.findById(convId);
    
    if (conv && !conv.firstResponderId) {
      await ConversationModel.updateOne(
        { _id: convId },
        {
          $set: {
            advisorId: advisorId,
            status: 'assigned',
            firstResponderId: advisorId,
            firstResponseAt: new Date(),
          }
        }
      );
    }
  }
}
