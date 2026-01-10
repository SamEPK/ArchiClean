import { IMessageRepository } from '@domain/repositories/IMessageRepository';
import { Message } from '@domain/entities/Message';
import { Conversation } from '@domain/entities/Conversation';
import * as fs from 'fs';
import * as path from 'path';

export class PersistentMessageRepository implements IMessageRepository {
  private messages: Map<string, Message> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private dataFile: string;
  private conversationsFile: string;
  private saveTimer: NodeJS.Timeout | null = null;

  constructor(dataDir: string = './data') {
    // Créer le dossier data s'il n'existe pas
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    this.dataFile = path.join(dataDir, 'client-advisor-messages.json');
    this.conversationsFile = path.join(dataDir, 'conversations.json');
    this.loadFromDisk();
    
    console.log(`[PersistentMessageRepository] Initialized with ${this.messages.size} messages and ${this.conversations.size} conversations`);
  }

  private loadFromDisk(): void {
    try {
      // Load messages
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf8');
        const messagesArray = JSON.parse(data);
        
        // Reconstruct Message objects with proper dates
        messagesArray.forEach((msgData: any) => {
          const message = new Message({
            id: msgData.id,
            conversationId: msgData.conversationId,
            senderId: msgData.senderId,
            content: msgData.content,
            timestamp: new Date(msgData.timestamp),
            isRead: msgData.isRead,
          });
          this.messages.set(message.id, message);
        });
        
        console.log(`[PersistentMessageRepository] Loaded ${this.messages.size} messages from disk`);
      }

      // Load conversations
      if (fs.existsSync(this.conversationsFile)) {
        const convData = fs.readFileSync(this.conversationsFile, 'utf8');
        const conversationsArray = JSON.parse(convData);
        
        conversationsArray.forEach((convData: any) => {
          const conv = new Conversation({
            id: convData.id,
            clientId: convData.clientId,
            advisorId: convData.advisorId,
            status: convData.status,
            createdAt: new Date(convData.createdAt),
            firstResponderId: convData.firstResponderId,
            firstResponseAt: convData.firstResponseAt ? new Date(convData.firstResponseAt) : null,
          });
          this.conversations.set(conv.id, conv);
        });
        
        console.log(`[PersistentMessageRepository] Loaded ${this.conversations.size} conversations from disk`);
      }
    } catch (error) {
      console.error('[PersistentMessageRepository] Error loading data:', error);
    }
  }

  private saveToDisk(): void {
    // Debounce: save after 1 second of no changes
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    
    this.saveTimer = setTimeout(() => {
      try {
        // Save messages
        const messagesArray = Array.from(this.messages.values()).map(msg => ({
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          isRead: msg.isRead,
        }));
        
        fs.writeFileSync(this.dataFile, JSON.stringify(messagesArray, null, 2), 'utf8');

        // Save conversations
        const conversationsArray = Array.from(this.conversations.values()).map(conv => ({
          id: conv.id,
          clientId: conv.clientId,
          advisorId: conv.advisorId,
          status: conv.status,
          createdAt: conv.createdAt.toISOString(),
        }));

        fs.writeFileSync(this.conversationsFile, JSON.stringify(conversationsArray, null, 2), 'utf8');
        
        console.log(`[PersistentMessageRepository] Saved ${this.messages.size} messages and ${this.conversations.size} conversations to disk`);
      } catch (error) {
        console.error('[PersistentMessageRepository] Error saving data:', error);
      }
    }, 1000);
  }

  async saveMessage(message: Message): Promise<void> {
    this.messages.set(message.id, message);
    this.saveToDisk();
  }

  async save(message: Message): Promise<void> {
    await this.saveMessage(message);
  }

  async listMessages(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createConversation(conv: Conversation): Promise<void> {
    this.conversations.set(conv.id, conv);
    this.saveToDisk();
  }

  async findOpenConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(c => c.status === 'open');
  }

  async assignConversation(convId: string, advisorId: string): Promise<void> {
    const conv = this.conversations.get(convId);
    if (conv) {
      conv.advisorId = advisorId;
      conv.status = 'assigned';
      this.saveToDisk();
    }
  }

  async transferConversation(convId: string, fromAdvisorId: string, toAdvisorId: string): Promise<void> {
    const conv = this.conversations.get(convId);
    if (conv && conv.advisorId === fromAdvisorId) {
      conv.advisorId = toAdvisorId;
      this.saveToDisk();
    }
  }

  async findConversationById(convId: string): Promise<Conversation | null> {
    return this.conversations.get(convId) || null;
  }

  async markConversationAssignedByFirstResponder(convId: string, advisorId: string): Promise<void> {
    const conv = this.conversations.get(convId);
    if (conv && conv.status === 'open') {
      conv.advisorId = advisorId;
      conv.status = 'assigned';
      conv.firstResponderId = advisorId;
      conv.firstResponseAt = new Date();
      this.saveToDisk();
    }
  }

  async findById(id: string): Promise<Message | null> {
    return this.messages.get(id) || null;
  }

  async findByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async findAll(): Promise<Message[]> {
    return Array.from(this.messages.values());
  }
}
