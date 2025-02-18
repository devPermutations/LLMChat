import { useEffect, useRef } from 'react';
import { MessageListProps } from '../../types/chat';
import MessageItem from './MessageItem';

const MessageList = ({ messages }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(messages.length);

  useEffect(() => {
    // Only scroll on initial load or when a new message starts (not during streaming)
    if (messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      prevMessageCountRef.current = messages.length;
    }
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col space-y-2">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
        <div style={{ height: '140px' }} aria-hidden="true" />
      </div>
    </div>
  );
};

export default MessageList; 