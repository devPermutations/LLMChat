import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatState } from '../types/chat';
import { generateResponse } from '../services/api';

const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const addMessage = useCallback((content: string, role: Message['role']) => {
    const newMessage: Message = {
      id: uuidv4(),
      content,
      role,
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    return newMessage;
  }, []);

  const updateLastMessage = useCallback((content: string) => {
    setState((prev) => ({
      ...prev,
      messages: prev.messages.map((msg, index) => 
        index === prev.messages.length - 1
          ? { ...msg, content }
          : msg
      ),
    }));
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const sendMessage = useCallback(async (content: string, model?: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      addMessage(content, 'user');

      abortControllerRef.current = new AbortController();

      let assistantMessage = addMessage('', 'assistant');

      await generateResponse(
        content,
        model,
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
  }, [addMessage, updateLastMessage]);

  const clearMessages = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [],
      error: null,
    }));
  }, []);

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