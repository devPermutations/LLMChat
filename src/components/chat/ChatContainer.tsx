/**
 * ChatContainer Component
 * Main container for the chat interface that manages the message list and input area.
 * Handles the overall layout and messaging functionality of the chat application.
 */
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import useChat from '../../hooks/useChat';
import { Session } from '../../types/chat';
import { SessionManager } from '../../services/sessionManager';

interface ChatContainerProps {
  sessionManager: SessionManager;
  currentSession: Session | null;
  onNewSession: () => void;
  onToggleStatus: () => void;
}

const ChatContainer = ({ 
  sessionManager, 
  currentSession, 
  onNewSession,
  onToggleStatus
}: ChatContainerProps) => {
  // Get chat functionality from custom hook
  // - messages: Array of chat messages
  // - isLoading: Boolean indicating if a response is being generated
  // - error: Error message if something goes wrong
  // - sendMessage: Function to send a new message
  // - stopGeneration: Function to stop the AI's response generation
  const { messages, isLoading, error, sendMessage, stopGeneration } = useChat({
    sessionManager,
    currentSession
  });

  return (
    <div className="flex flex-col h-screen">
      {/* Main scrollable container */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-3xl h-full px-4">
          <div className="py-4 space-y-4">
            {/* List of chat messages */}
            <MessageList messages={currentSession?.messages || messages} />
            
            {/* Error message display */}
            {error && (
              <div className="bg-red-500/80 px-4 py-2 text-sm text-center text-white rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Input Area: Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-gray-700 bg-chat-bg">
        <div className="container mx-auto max-w-3xl px-4 py-4">
          <ChatInput
            onSendMessage={sendMessage}
            onStop={stopGeneration}
            isLoading={isLoading}
            onNewSession={onNewSession}
            onToggleStatus={onToggleStatus}
            currentSession={currentSession}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatContainer; 