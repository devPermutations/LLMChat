import MessageList from './MessageList';
import ChatInput from './ChatInput';
import useChat from '../../hooks/useChat';

const ChatContainer = () => {
  const { messages, isLoading, error, sendMessage, stopGeneration } = useChat();

  return (
    <div className="relative h-screen bg-chat-bg">
      {/* Chat messages area */}
      <div className="h-full overflow-y-auto pb-40" style={{ padding: '0 100px' }}>
        <div className="container mx-auto max-w-3xl">
          <MessageList messages={messages} />
          {error && (
            <div className="bg-red-500/80 px-4 py-2 text-sm text-center text-white rounded-lg mt-4">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <ChatInput 
        onSendMessage={sendMessage} 
        onStop={stopGeneration}
        isLoading={isLoading} 
      />
    </div>
  );
};

export default ChatContainer; 