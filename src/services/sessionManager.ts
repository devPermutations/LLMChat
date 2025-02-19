import { Session, Message } from '../types/chat';
import { ContextManager } from './contextManager';
import { DatabaseService } from './database';

export class SessionManager {
  private sessions: Map<string, Session>;
  private currentSessionId: string | null;
  private contextManagers: Map<string, ContextManager>;
  private db: DatabaseService;

  constructor() {
    this.sessions = new Map();
    this.currentSessionId = null;
    this.contextManagers = new Map();
    this.db = new DatabaseService();
    this.loadSessions();
  }

  /**
   * Create a new chat session
   */
  public async createSession(model: string = 'deepseek-r1:14b'): Promise<Session> {
    const session: Session = {
      id: crypto.randomUUID(),
      name: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      model,
      totalTokens: 0
    };

    // Save to database
    await this.db.createSession(session);
    
    // Update local state
    this.sessions.set(session.id, session);
    this.contextManagers.set(session.id, new ContextManager(session));
    this.currentSessionId = session.id;

    return session;
  }

  /**
   * Get all available sessions
   */
  public async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }

  /**
   * Get the current active session
   */
  public getCurrentSession(): Session | null {
    return this.currentSessionId ? this.sessions.get(this.currentSessionId) || null : null;
  }

  /**
   * Switch to a different session
   */
  public switchSession(sessionId: string): Session | null {
    if (this.sessions.has(sessionId)) {
      this.currentSessionId = sessionId;
      return this.sessions.get(sessionId) || null;
    }
    return null;
  }

  /**
   * Add a message to the current session
   */
  public async addMessage(message: Message): Promise<void> {
    if (!this.currentSessionId) {
      throw new Error('No active session');
    }

    const contextManager = this.contextManagers.get(this.currentSessionId);
    if (!contextManager) {
      throw new Error('No context manager for current session');
    }

    // Add message to context manager
    contextManager.addMessage(message);

    // Save message to database
    await this.db.addMessage(this.currentSessionId, message);

    // Update session in database
    const session = this.sessions.get(this.currentSessionId);
    if (session) {
      await this.db.updateSession(session);
    }
  }

  /**
   * Delete a session
   */
  public async deleteSession(sessionId: string): Promise<void> {
    // Delete from database
    await this.db.deleteSession(sessionId);
    
    // Update local state
    this.sessions.delete(sessionId);
    this.contextManagers.delete(sessionId);
    
    if (this.currentSessionId === sessionId) {
      const remainingSessions = Array.from(this.sessions.keys());
      this.currentSessionId = remainingSessions.length > 0 ? remainingSessions[0] : null;
    }
  }

  /**
   * Get relevant context for the current query
   */
  public getRelevantContext(): Message[] {
    if (!this.currentSessionId) {
      return [];
    }

    const contextManager = this.contextManagers.get(this.currentSessionId);
    return contextManager ? contextManager.getRelevantContext() : [];
  }

  /**
   * Get the ContextManager for a specific session
   */
  public getContextManager(sessionId: string): ContextManager | null {
    return this.contextManagers.get(sessionId) || null;
  }

  /**
   * Load sessions from database
   */
  private async loadSessions(): Promise<void> {
    const sessions = await this.db.getAllSessions();
    sessions.forEach(session => {
      this.sessions.set(session.id, session);
      this.contextManagers.set(session.id, new ContextManager(session));
    });

    // Set the most recently updated session as current
    if (sessions.length > 0) {
      const mostRecent = sessions.reduce((a, b) => 
        a.updatedAt > b.updatedAt ? a : b
      );
      this.currentSessionId = mostRecent.id;
    }
  }

  /**
   * Update an existing message
   */
  public async updateMessage(message: Message): Promise<void> {
    // Update message in database
    await this.db.updateMessage(message);
    
    // If this is for the current session, update the session in database
    if (this.currentSessionId) {
      const session = this.sessions.get(this.currentSessionId);
      if (session) {
        await this.db.updateSession(session);
      }
    }
  }

  /**
   * Update an existing session
   */
  public async updateSession(session: Session): Promise<void> {
    console.log('Updating session:', {
      id: session.id,
      name: session.name,
      messageCount: session.messages.length,
      totalTokens: session.totalTokens
    });
    
    // Update session in database
    await this.db.updateSession(session);
    
    // Update local state
    this.sessions.set(session.id, session);
    
    console.log('Session updated successfully');
  }
} 