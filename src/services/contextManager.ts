import { Message, Session, ContextWindowConfig } from '../types/chat';
import { encode } from 'gpt-tokenizer';

const DEFAULT_CONFIG: ContextWindowConfig = {
  maxTokens: 8192, // Default max tokens for most models
  trimThreshold: 7000, // When to start trimming history
  summarizationThreshold: 6000 // When to start summarizing history
};

export class ContextManager {
  private session: Session;
  private config: ContextWindowConfig;

  constructor(session: Session, config: Partial<ContextWindowConfig> = {}) {
    this.session = session;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Add a new message to the session and update token counts
   */
  public addMessage(message: Message): void {
    const tokenCount = this.countTokens(message.content);
    message.tokenCount = tokenCount;
    
    this.session.messages.push(message);
    this.session.totalTokens += tokenCount;
    this.session.updatedAt = new Date();

    // Check if we need to trim or summarize
    if (this.session.totalTokens >= this.config.trimThreshold) {
      this.trimHistory();
    }
  }

  /**
   * Remove older messages to keep within token limit
   */
  public trimHistory(): void {
    while (this.session.totalTokens > this.config.trimThreshold && this.session.messages.length > 2) {
      const removedMessage = this.session.messages.shift();
      if (removedMessage?.tokenCount) {
        this.session.totalTokens -= removedMessage.tokenCount;
      }
    }
  }

  /**
   * Summarize the conversation history to reduce token usage
   */
  public async summarizeHistory(): Promise<string> {
    const historyToSummarize = this.session.messages
      .slice(0, -4) // Keep the last 4 messages as is
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    // TODO: Implement actual summarization using an LLM
    // For now, we'll just return a placeholder
    const summary = `Previous conversation summary: ${historyToSummarize.slice(0, 200)}...`;
    
    // Replace old messages with summary
    const summarizedMessage: Message = {
      id: crypto.randomUUID(),
      content: summary,
      role: 'assistant',
      timestamp: new Date(),
      tokenCount: this.countTokens(summary)
    };

    this.session.messages = [summarizedMessage, ...this.session.messages.slice(-4)];
    this.updateTotalTokens();
    
    return summary;
  }

  /**
   * Get the current token count for the session
   */
  public getCurrentTokenCount(): number {
    return this.session.totalTokens;
  }

  /**
   * Get messages relevant to the current query using semantic similarity
   */
  public getRelevantContext(query: string): Message[] {
    // TODO: Implement semantic search to find relevant messages
    // For now, return the last few messages as context
    return this.session.messages.slice(-5);
  }

  /**
   * Count tokens in a string using GPT tokenizer
   */
  public countTokens(text: string): number {
    return encode(text).length;
  }

  /**
   * Recalculate total tokens for the session
   */
  private updateTotalTokens(): void {
    this.session.totalTokens = this.session.messages.reduce(
      (total, msg) => total + (msg.tokenCount || this.countTokens(msg.content)),
      0
    );
  }
} 