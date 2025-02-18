import { useState, KeyboardEvent } from 'react';
import { ChatInputProps } from '../../types/chat';

const ChatInput = ({ onSendMessage, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !disabled) {
        onSendMessage(message.trim());
        setMessage('');
      }
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90ch',
        maxWidth: '90vw',
        zIndex: 1000
      }}
    >
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... (Press Enter to send)"
        style={{
          width: '100%',
          height: '60px',
          padding: '16px',
          backgroundColor: 'rgba(31, 41, 55, 0.95)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          resize: 'none',
          outline: 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)'
        }}
        disabled={disabled}
      />
    </div>
  );
};

export default ChatInput; 