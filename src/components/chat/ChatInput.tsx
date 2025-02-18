import { useState, KeyboardEvent } from 'react';
import { ChatInputProps } from '../../types/chat';
import { StopIcon } from '@heroicons/react/24/solid';

const ChatInput = ({ onSendMessage, onStop, isLoading = false }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !isLoading) {
        onSendMessage(message.trim());
        setMessage('');
      }
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'fixed', bottom: '32px', zIndex: 1000 }}>
      <div style={{ position: 'relative', width: '90ch', maxWidth: '90vw' }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Press Enter to send)"
          style={{
            width: '100%',
            height: '60px',
            padding: '16px 100px 16px 16px',
            backgroundColor: 'rgba(31, 41, 55, 0.95)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            resize: 'none',
            outline: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(8px)'
          }}
          disabled={isLoading}
        />
        {isLoading && (
          <button
            onClick={onStop}
            style={{
              position: 'absolute',
              right: '-100px',
              bottom: '12px',
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '20px',
              padding: '4px 12px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              justifyContent: 'center',
              border: '1px solid #dc2626',
              cursor: 'pointer',
              transition: 'all 0.2s',
              zIndex: 2000,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <StopIcon style={{ width: '14px', height: '14px' }} />
            Stop
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatInput; 