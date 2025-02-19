export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  tokenCount?: number;
}

export interface Session {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  model: string;
  totalTokens: number;
}

export interface ChatState {
  sessions: Session[];
  currentSessionId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface ChatInputProps {
  onSendMessage: (message: string, model?: string) => void;
  onStop: () => void;
  onNewSession: () => void;
  isLoading?: boolean;
  currentSession: Session | null;
  onToggleStatus?: () => void;
}

export interface MessageListProps {
  messages: Message[];
}

export interface MessageItemProps {
  message: Message;
}

export interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  models: string[];
}

export interface ContextWindowConfig {
  maxTokens: number;
  trimThreshold: number;
  summarizationThreshold: number;
}

export interface ContextManager {
  addMessage: (message: Message) => void;
  trimHistory: () => void;
  summarizeHistory: () => Promise<string>;
  getCurrentTokenCount: () => number;
  getRelevantContext: (query: string) => Message[];
} 