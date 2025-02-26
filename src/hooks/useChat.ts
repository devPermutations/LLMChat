import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatState, Session } from '../types/chat';
import { generateResponse } from '../services/api';
import { SessionManager } from '../services/sessionManager';

interface UseChatProps {
  sessionManager: SessionManager;
  currentSession: Session | null;
}

const useChat = ({ sessionManager, currentSession }: UseChatProps) => {
  const [state, setState] = useState<ChatState>({
    sessions: [],
    currentSessionId: null,
    messages: [],
    isLoading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Update local state when session changes
  useEffect(() => {
    if (currentSession) {
      setState(prev => ({
        ...prev,
        messages: currentSession.messages,
        currentSessionId: currentSession.id
      }));
    }
  }, [currentSession]);

  const addMessage = useCallback((content: string, role: Message['role']) => {
    const newMessage: Message = {
      id: uuidv4(),
      content,
      role,
      timestamp: new Date(),
    };

    if (currentSession) {
      sessionManager.addMessage(newMessage);
    }

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    return newMessage;
  }, [currentSession, sessionManager]);

  const updateLastMessage = useCallback(async (content: string) => {
    setState((prev) => ({
      ...prev,
      messages: prev.messages.map((msg, index) => 
        index === prev.messages.length - 1
          ? { ...msg, content }
          : msg
      ),
    }));

    if (currentSession) {
      const updatedMessages = [...currentSession.messages];
      if (updatedMessages.length > 0) {
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        lastMessage.content = content;
        
        // Recalculate token count for the updated message
        const contextManager = sessionManager.getContextManager(currentSession.id);
        if (contextManager) {
          // Subtract old token count
          const oldTokenCount = lastMessage.tokenCount || 0;
          currentSession.totalTokens -= oldTokenCount;
          
          // Add new token count
          const newTokenCount = contextManager.countTokens(content);
          lastMessage.tokenCount = newTokenCount;
          currentSession.totalTokens += newTokenCount;

          // Update the message in the database
          await sessionManager.updateMessage(lastMessage);
        }

        currentSession.messages = updatedMessages;
        currentSession.updatedAt = new Date();
      }
    }
  }, [currentSession, sessionManager]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const sendMessage = useCallback(async (content: string, model?: string) => {
    if (!currentSession) {
      setState(prev => ({ 
        ...prev, 
        error: 'No active session. Please create a new chat session.' 
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // If this is a new session (no messages), set the name first
      if (currentSession.messages.length === 0) {
        // Take first 6 words or all words if less than 6
        const words = content.split(/\s+/);
        const titleWords = words.slice(0, 6);
        const sessionName = titleWords.join(' ');
        
        // Update session name
        currentSession.name = sessionName;
        await sessionManager.updateSession(currentSession);
      }

      // Add user message to the session
      addMessage(content, 'user');

      abortControllerRef.current = new AbortController();

      // Get the context manager for the current session
      const contextManager = sessionManager.getContextManager(currentSession.id);
      if (!contextManager) {
        throw new Error('Failed to get context manager');
      }

      // Get the relevant context including conversation history
      const contextMessages = contextManager.getRelevantContext();
      
      // Format the full conversation context for the LLM
      const fullPrompt = contextMessages
        .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      let assistantMessage = addMessage('', 'assistant');

      await generateResponse(
        fullPrompt,
        model || currentSession.model,
        (partial) => {
          assistantMessage.content += partial;
          updateLastMessage(assistantMessage.content);
        },
        abortControllerRef.current.signal
      );

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      if (error instanceof Error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
      }
    }
  }, [addMessage, updateLastMessage, currentSession, sessionManager]);

  const clearMessages = useCallback(() => {
    if (currentSession) {
      currentSession.messages = [];
      currentSession.totalTokens = 0;
      currentSession.updatedAt = new Date();
    }

    setState((prev) => ({
      ...prev,
      messages: [],
      error: null,
    }));
  }, [currentSession]);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
    clearMessages,
    stopGeneration,
  };
};

export default useChat; 