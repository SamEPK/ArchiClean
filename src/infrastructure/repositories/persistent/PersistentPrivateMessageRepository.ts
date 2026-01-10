import { IPrivateMessageRepository } from '@domain/repositories/IPrivateMessageRepository';
import { PrivateMessage } from '@domain/entities/PrivateMessage';
import * as fs from 'fs';
import * as path from 'path';

export class PersistentPrivateMessageRepository implements IPrivateMessageRepository {
  private messages: Map<string, PrivateMessage> = new Map();
  private dataFile: string;
  private saveTimer: NodeJS.Timeout | null = null;

  constructor(dataDir: string = './data') {
    // Créer le dossier data s'il n'existe pas
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    this.dataFile = path.join(dataDir, 'private-messages.json');
    this.loadFromDisk();
    
    console.log(`[PersistentPrivateMessageRepository] Initialized with ${this.messages.size} messages from ${this.dataFile}`);
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf8');
        const messagesArray = JSON.parse(data);
        
        // Reconstruct PrivateMessage objects with proper dates
        messagesArray.forEach((msgData: any) => {
          const message = new PrivateMessage({
            id: msgData.id,
            senderId: msgData.senderId,
            receiverId: msgData.receiverId,
            content: msgData.content,
            isRead: msgData.isRead,
            createdAt: new Date(msgData.createdAt),
            updatedAt: msgData.updatedAt ? new Date(msgData.updatedAt) : undefined,
          });
          this.messages.set(message.id, message);
        });
        
        console.log(`[PersistentPrivateMessageRepository] Loaded ${this.messages.size} messages from disk`);
      }
    } catch (error) {
      console.error('[PersistentPrivateMessageRepository] Error loading data:', error);
    }
  }

  private saveToDisk(): void {
    // Debounce: save after 1 second of no changes
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    
    this.saveTimer = setTimeout(() => {
      try {
        const messagesArray = Array.from(this.messages.values()).map(msg => ({
          id: msg.id,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          content: msg.content,
          createdAt: msg.createdAt.toISOString(),
          isRead: msg.isRead,
        }));
        
        fs.writeFileSync(this.dataFile, JSON.stringify(messagesArray, null, 2), 'utf8');
        console.log(`[PersistentPrivateMessageRepository] Saved ${this.messages.size} messages to disk`);
      } catch (error) {
        console.error('[PersistentPrivateMessageRepository] Error saving data:', error);
      }
    }, 1000);
  }

  async create(message: PrivateMessage): Promise<void> {
    this.messages.set(message.id, message);
    this.saveToDisk();
  }

  async findById(id: string): Promise<PrivateMessage | null> {
    return this.messages.get(id) || null;
  }

  async findConversation(userId1: string, userId2: string, limit: number = 50): Promise<PrivateMessage[]> {
    const messages = Array.from(this.messages.values())
      .filter(
        m =>
          (m.senderId === userId1 && m.receiverId === userId2) || (m.senderId === userId2 && m.receiverId === userId1)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    return messages;
  }

  async markAsRead(messageId: string): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      message.markAsRead();
      this.saveToDisk();
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    return Array.from(this.messages.values()).filter(m => m.receiverId === userId && !m.isRead).length;
  }

  async countUnreadMessages(userId: string): Promise<number> {
    return this.getUnreadCount(userId);
  }

  async findAll(): Promise<PrivateMessage[]> {
    return Array.from(this.messages.values());
  }

  async getUserConversations(userId: string): Promise<{ userId: string; lastMessage: PrivateMessage }[]> {
    const conversations = new Map<string, PrivateMessage>();

    Array.from(this.messages.values())
      .filter(m => m.senderId === userId || m.receiverId === userId)
      .forEach(message => {
        const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;

        const existing = conversations.get(otherUserId);
        if (!existing || message.createdAt > existing.createdAt) {
          conversations.set(otherUserId, message);
        }
      });

    return Array.from(conversations.entries()).map(([userId, lastMessage]) => ({
      userId,
      lastMessage,
    }));
  }
}
