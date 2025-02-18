export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface ChatInputProps {
  onSendMessage: (message: string, model?: string) => void;
  onStop: () => void;
  isLoading?: boolean;
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