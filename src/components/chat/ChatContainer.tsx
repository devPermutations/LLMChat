import MessageList from './MessageList';
import ChatInput from './ChatInput';
import useChat from '../../hooks/useChat';

const ChatContainer = () => {
  const { messages, isLoading, error, sendMessage } = useChat();

  return (
    <div className="flex h-screen flex-col bg-chat-bg">
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} />
      </div>
      {error && (
        <div className="bg-red-500 p-2 text-center text-white">
          {error}
        </div>
      )}
      <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatContainer; 