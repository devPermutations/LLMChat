/**
 * History Component
 * Displays chat session history with conversation details
 */

import { useState } from 'react';
import { DatabaseService } from '../services/database';
import { Session, Message } from '../types/chat';

interface HistoryProps {
  sessions: Session[];
}

const History = ({ sessions }: HistoryProps) => {
  // Initialize database service and state management
  const [db] = useState(() => new DatabaseService());
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  // Common button style (matching ChatInput.tsx)
  const buttonStyle = {
    backgroundColor: 'black',
    color: 'white',
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '9999px',
    border: '1px solid white',
    lineHeight: '1',
    cursor: 'pointer',
    minHeight: 'unset',
    marginLeft: '8px',
    transition: 'background-color 0.2s ease',
  };

  // Common button hover handlers
  const handleMouseOver = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.backgroundColor = '#333';
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.backgroundColor = 'black';
  };

  // Helper function to format conversation history
  const formatConversationHistory = (messages: Message[]): string => {
    return messages
      .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');
  };

  // Handle database wipe
  const handleWipeDatabase = async () => {
    if (window.confirm('Are you sure you want to wipe all chat history? This action cannot be undone.')) {
      try {
        await db.wipeDatabase();
        setSelectedSession(null);
      } catch (error) {
        console.error('Failed to wipe database:', error);
        alert('Failed to wipe database. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold">Chat History</h1>
        <div className="flex items-center">
          <a
            href="/"
            style={{
              ...buttonStyle,
              textDecoration: 'none',
              display: 'inline-block'
            }}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            Back to Chat
          </a>
          <button
            onClick={handleWipeDatabase}
            style={buttonStyle}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            Wipe Database
          </button>
        </div>
      </div>

      {/* Session List Section */}
      <div className="grid gap-2">
        {sessions.map(session => (
          <div
            key={session.id}
            className={`bg-gray-800 p-3 rounded-lg cursor-pointer transition-colors text-sm ${
              selectedSession === session.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedSession(session.id)}
          >
            {/* Session Summary Line */}
            <div className="flex items-center">
              <h3 className="font-semibold">{session.name || 'Unnamed Session'}</h3>
              <span className="text-gray-400 ml-2">
                {session.messages.length} messages - {session.totalTokens.toLocaleString()} tokens - {new Date(session.createdAt).toLocaleString()}
              </span>
            </div>

            {/* Conversation History (shown when selected) */}
            {selectedSession === session.id && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <pre className="bg-gray-900 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                  {formatConversationHistory(session.messages)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default History; 