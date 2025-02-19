/**
 * History Component
 * Displays chat session history with conversation details
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DatabaseService } from '../services/database';
import { Session } from '../types/chat';

interface HistoryProps {
  sessions: Session[];
}

const History = ({ sessions }: HistoryProps) => {
  const navigate = useNavigate();
  // Initialize database service and state management
  const [db] = useState(() => new DatabaseService());
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [localSessions, setLocalSessions] = useState<Session[]>(sessions);

  // Load sessions from database
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const dbSessions = await db.getAllSessions();
        console.log('All loaded sessions:', dbSessions);
        
        // Filter out empty sessions
        const validSessions = dbSessions.filter(session => 
          session.messages && 
          session.messages.length > 0 && 
          session.totalTokens > 0
        );
        
        console.log('Valid sessions after filtering:', validSessions);
        setLocalSessions(validSessions);
      } catch (error) {
        console.error('Failed to load sessions:', error);
      }
    };

    loadSessions();
  }, [db]);

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

  // Handle database wipe
  const handleWipeDatabase = async () => {
    if (window.confirm('Are you sure you want to wipe all chat history? This action cannot be undone.')) {
      try {
        await db.wipeDatabase();
        setSelectedSession(null);
        setLocalSessions([]);
      } catch (error) {
        console.error('Failed to wipe database:', error);
        alert('Failed to wipe database. Please try again.');
      }
    }
  };

  console.log('Current local sessions:', localSessions);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 style={{ fontSize: '18px', fontWeight: 500 }}>Chat History</h1>
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
      <div className="grid gap-4">
        {localSessions.map(session => {
          const isSelected = selectedSession === session.id;
          return (
            <div key={session.id}>
              {/* Session Header */}
              <div
                className={`bg-gray-800 p-3 rounded-lg cursor-pointer transition-colors text-sm ${
                  isSelected ? 'rounded-b-none' : ''
                }`}
                onClick={() => {
                  setSelectedSession(isSelected ? null : session.id);
                }}
              >
                <div className="flex items-center">
                  <h3 style={{ fontSize: '16px', fontWeight: 'normal' }}>"{session.name || 'Unnamed Session'}"</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/?session=${session.id}`);
                    }}
                    style={buttonStyle}
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                    className="ml-2"
                    aria-label="Resume chat session"
                  >
                    Resume
                  </button>
                  <span className="text-gray-400 ml-2" style={{ fontSize: '14px' }}>
                    {session.messages.length} messages - {session.totalTokens.toLocaleString()} tokens - {new Date(session.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Expandable History Section */}
              {isSelected && (
                <div className="bg-gray-800 border-t border-gray-700 rounded-b-lg">
                  <div 
                    className="m-3 p-3 bg-gray-900 rounded"
                    style={{ 
                      height: '250px',
                      overflow: 'auto',
                      position: 'relative'
                    }}
                  >
                    <div className="text-xs space-y-6">
                      {session.messages.map((msg, index) => (
                        <div 
                          key={index}
                          style={{ 
                            color: msg.role === 'user' ? '#7dd3fc' : 'white',
                            whiteSpace: 'pre-wrap',
                            marginTop: index === 0 ? '0.5rem' : '1rem'
                          }}
                        >
                          {'\n'}{msg.role === 'user' ? 'Human: ' : 'Assistant: '}
                          {msg.content?.trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default History; 