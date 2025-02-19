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

  // Analytics queries
  public async getTokenUsageByDay(): Promise<{ date: string; tokens: number }[]> {
    const messages = await this.db.messages.toArray();
    const usageByDay = messages.reduce((acc, msg) => {
      const date = msg.timestamp.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + (msg.tokenCount || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(usageByDay)
      .map(([date, tokens]) => ({ date, tokens }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);
  }

  public async getTokenUsageByModel(): Promise<{ model: string; tokens: number }[]> {
    const sessions = await this.db.sessions.toArray();
    const messages = await this.db.messages.toArray();

    const usageByModel = messages.reduce((acc, msg) => {
      const session = sessions.find(s => s.id === msg.sessionId);
      if (session) {
        acc[session.model] = (acc[session.model] || 0) + (msg.tokenCount || 0);
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(usageByModel)
      .map(([model, tokens]) => ({ model, tokens }))
      .sort((a, b) => b.tokens - a.tokens);
  }

  public async getTokenUsageByRole(): Promise<{ role: string; tokens: number }[]> {
    const messages = await this.db.messages.toArray();
    const usageByRole = messages.reduce((acc, msg) => {
      acc[msg.role] = (acc[msg.role] || 0) + (msg.tokenCount || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(usageByRole)
      .map(([role, tokens]) => ({ role, tokens }));
  }

  public async getSessionStats(sessionId: string): Promise<{
    messageCount: number;
    totalTokens: number;
    userTokens: number;
    assistantTokens: number;
    duration: number;
  }> {
    const messages = await this.db.messages
      .where('sessionId')
      .equals(sessionId)
      .toArray();

    if (messages.length === 0) {
      return {
        messageCount: 0,
        totalTokens: 0,
        userTokens: 0,
        assistantTokens: 0,
        duration: 0
      };
    }

    const stats = messages.reduce(
      (acc, msg) => {
        acc.totalTokens += msg.tokenCount || 0;
        if (msg.role === 'user') {
          acc.userTokens += msg.tokenCount || 0;
        } else {
          acc.assistantTokens += msg.tokenCount || 0;
        }
        return acc;
      },
      { totalTokens: 0, userTokens: 0, assistantTokens: 0 }
    );

    const timestamps = messages.map(m => m.timestamp.getTime());
    const duration = Math.max(...timestamps) - Math.min(...timestamps);

    return {
      messageCount: messages.length,
      totalTokens: stats.totalTokens,
      userTokens: stats.userTokens,
      assistantTokens: stats.assistantTokens,
      duration: Math.floor(duration / 1000) // Convert to seconds
    };
  }

  // Add this new method
  public async wipeDatabase(): Promise<void> {
    try {
      await this.db.delete();
      // Reinitialize the database
      this.db = new ChatDatabase();
    } catch (error) {
      console.error('Error wiping database:', error);
      throw error;
    }
  }
} 