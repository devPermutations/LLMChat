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

  // Create empty spaces that match message height/padding
  const EmptySpace = () => (
    <div style={{ width: '100%', boxSizing: 'border-box', height: '60px' }} />
  );

  return (
    <div className="flex flex-col w-full">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      {/* Add 6 empty spaces at the bottom */}
      <EmptySpace />
      <EmptySpace />
      <EmptySpace />
      <EmptySpace />
      <EmptySpace />
      <EmptySpace />
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 