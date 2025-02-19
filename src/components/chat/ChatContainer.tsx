/**
 * ChatContainer Component
 * Main container for the chat interface that manages the message list and input area.
 * Handles the overall layout and messaging functionality of the chat application.
 */
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import useChat from '../../hooks/useChat';

const ChatContainer = () => {
  // Get chat functionality from custom hook
  // - messages: Array of chat messages
  // - isLoading: Boolean indicating if a response is being generated
  // - error: Error message if something goes wrong
  // - sendMessage: Function to send a new message
  // - stopGeneration: Function to stop the AI's response generation
  const { messages, isLoading, error, sendMessage, stopGeneration } = useChat();

  return (
    <div className="relative h-screen bg-chat-bg">
      {/* Messages Container: Scrollable area for chat messages */}
      <div className="h-full overflow-y-auto pb-40" style={{ padding: '0 50px' }}>
        {/* Center-aligned container with max width for better readability */}
        <div className="container mx-auto max-w-3xl">
          {/* List of chat messages */}
          <MessageList messages={messages} />
          
          {/* Error message display */}
          {error && (
            <div className="bg-red-500/80 px-4 py-2 text-sm text-center text-white rounded-lg mt-4">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Chat Input Area: Fixed at the bottom */}
      <ChatInput 
        onSendMessage={sendMessage} 
        onStop={stopGeneration}
        isLoading={isLoading} 
      />
    </div>
  );
};

export default ChatContainer; 