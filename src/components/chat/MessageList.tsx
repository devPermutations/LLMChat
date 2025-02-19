import { useEffect, useRef } from 'react';
import { MessageListProps } from '../../types/chat';
import MessageItem from './MessageItem';

const MessageList = ({ messages }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(messages.length);

  useEffect(() => {
    // Scroll to bottom on initial load and when new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  return (
    <div className="flex flex-col min-h-0 w-full">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 