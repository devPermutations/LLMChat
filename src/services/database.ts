import Dexie, { Table } from 'dexie';
import { Session, Message } from '../types/chat';

interface DbSession {
  id: string;
  name: string;
  model: string;
  createdAt: Date;
  updatedAt: Date;
  totalTokens: number;
}

interface DbMessage {
  id: string;
  sessionId: string;
  content: string;
  role: string;
  tokenCount: number;
  timestamp: Date;
}

class ChatDatabase extends Dexie {
  sessions!: Table<DbSession>;
  messages!: Table<DbMessage>;

  constructor() {
    super('ChatDatabase');
    this.version(1).stores({
      sessions: 'id, name, model, createdAt, updatedAt, totalTokens',
      messages: 'id, sessionId, content, role, tokenCount, timestamp, [sessionId+timestamp]'
    });
  }
}

export class DatabaseService {
  private db: ChatDatabase;

  constructor() {
    this.db = new ChatDatabase();
  }

  // Session operations
  public async createSession(session: Session): Promise<void> {
    await this.db.sessions.add({
      id: session.id,
      name: session.name,
      model: session.model,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      totalTokens: session.totalTokens
    });
  }

  public async updateSession(session: Session): Promise<void> {
    await this.db.sessions.update(session.id, {
      name: session.name,
      model: session.model,
      updatedAt: session.updatedAt,
      totalTokens: session.totalTokens
    });
  }

  public async getAllSessions(): Promise<Session[]> {
    const sessions = await this.db.sessions.toArray();
    const sessionsWithMessages = await Promise.all(
      sessions.map(async session => ({
        ...session,
        messages: await this.getSessionMessages(session.id)
      }))
    );
    return sessionsWithMessages;
  }

  public async getSession(id: string): Promise<Session | null> {
    const session = await this.db.sessions.get(id);
    if (!session) return null;

    const messages = await this.getSessionMessages(id);
    return {
      ...session,
      messages
    };
  }

  public async deleteSession(id: string): Promise<void> {
    await this.db.messages.where('sessionId').equals(id).delete();
    await this.db.sessions.delete(id);
  }

  // Message operations
  public async addMessage(sessionId: string, message: Message): Promise<void> {
    await this.db.messages.add({
      id: message.id,
      sessionId,
      content: message.content,
      role: message.role,
      tokenCount: message.tokenCount || 0,
      timestamp: message.timestamp
    });
  }

  public async updateMessage(message: Message): Promise<void> {
    await this.db.messages.update(message.id, {
      content: message.content,
      tokenCount: message.tokenCount || 0
    });
  }

  public async getSessionMessages(sessionId: string): Promise<Message[]> {
    const messages = await this.db.messages
      .where('sessionId')
      .equals(sessionId)
      .sortBy('timestamp');

    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role as 'user' | 'assistant',
      tokenCount: msg.tokenCount,
      timestamp: msg.timestamp
    }));
  }

  // Database management
  public async wipeDatabase(): Promise<void> {
    try {
      await this.db.delete();
      this.db = new ChatDatabase();
    } catch (error) {
      console.error('Error wiping database:', error);
      throw error;
    }
  }
} 