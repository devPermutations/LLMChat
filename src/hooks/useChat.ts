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

  const sendMessage = useCallback(async (content: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      // Add user message
      const userMessage = addMessage(content, 'user');

      try {
        // Add initial assistant message
        const assistantMessage = addMessage('', 'assistant');
        let fullResponse = '';

        // Get AI response with streaming
        await generateResponse(
          content,
          'deepseek-r1:14b',
          (partial) => {
            fullResponse += partial;
            updateLastMessage(fullResponse);
          }
        );
      } catch (error) {
        // Remove both messages if AI fails to respond
        setState((prev) => ({
          ...prev,
          messages: prev.messages.filter(msg => 
            msg.id !== userMessage.id
          ),
          error: error instanceof Error ? error.message : 'Failed to send message. Please try again.',
        }));
      }
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
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
  };
};

export default useChat; 