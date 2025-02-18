import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatState } from '../types/chat';
import { generateResponse } from '../services/api';

const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

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

  const sendMessage = useCallback(async (content: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      // Add user message
      addMessage(content, 'user');

      // Get AI response
      const response = await generateResponse(content);
      
      // Add AI message
      addMessage(response, 'assistant');
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: 'Failed to send message. Please try again.',
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [addMessage]);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
  };
};

export default useChat; 