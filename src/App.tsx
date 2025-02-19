/**
 * Main Application Component
 * Handles the overall application structure, routing, and session management.
 * Features:
 * - Chat interface with session management
 * - History page for analytics
 * - Session list sidebar
 * - Navigation and status display
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatContainer from './components/chat/ChatContainer';
import { OllamaStatus } from './components/OllamaStatus';
import SessionList from './components/chat/SessionList';
import History from './pages/History';
import { SessionManager } from './services/sessionManager';
import { Session } from './types/chat';

const App = () => {
  // Initialize core services and state
  const [sessionManager] = useState(() => new SessionManager());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  /**
   * Initialize sessions on component mount
   * - Loads existing sessions from database
   * - Sets current session
   * - Creates initial session if none exists
   */
  useEffect(() => {
    const initializeSessions = async () => {
      try {
        const loadedSessions = await sessionManager.getAllSessions();
        setSessions(loadedSessions);
        
        const current = sessionManager.getCurrentSession();
        if (current) {
          setCurrentSession(current);
        } else if (loadedSessions.length === 0) {
          // Create initial session if none exists
          const newSession = await sessionManager.createSession();
          setSessions([newSession]);
          setCurrentSession(newSession);
        }
      } catch (error) {
        console.error('Failed to initialize sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSessions();
  }, []);

  /**
   * Session Management Handlers
   */
  
  // Switch to a different chat session
  const handleSessionSelect = (sessionId: string) => {
    const session = sessionManager.switchSession(sessionId);
    setCurrentSession(session);
  };

  // Create a new chat session
  const handleNewSession = async () => {
    try {
      const session = await sessionManager.createSession();
      const allSessions = await sessionManager.getAllSessions();
      setSessions(allSessions);
      setCurrentSession(session);
    } catch (error) {
      console.error('Failed to create new session:', error);
    }
  };

  // Delete an existing chat session
  const handleSessionDelete = async (sessionId: string) => {
    try {
      await sessionManager.deleteSession(sessionId);
      const allSessions = await sessionManager.getAllSessions();
      setSessions(allSessions);
      setCurrentSession(sessionManager.getCurrentSession());
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  // Rename an existing chat session
  const handleSessionRename = (sessionId: string, newName: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.name = newName;
      session.updatedAt = new Date();
      setSessions([...sessions]);
    }
  };

  // Loading state display
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white">
        {/* Top Navigation Bar */}
        <nav className="bg-gray-800 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
              </div>
              <OllamaStatus isVisible={showStatus} />
            </div>
          </div>
        </nav>

        {/* Application Routes */}
        <Routes>
          {/* Main Chat Route */}
          <Route 
            path="/" 
            element={
              <div className="flex flex-1">
                <ChatContainer 
                  sessionManager={sessionManager}
                  currentSession={currentSession}
                  onNewSession={handleNewSession}
                  onToggleStatus={() => setShowStatus(!showStatus)}
                />
                <SessionList
                  sessions={sessions}
                  currentSessionId={currentSession?.id ?? null}
                  onSessionSelect={handleSessionSelect}
                  onSessionDelete={handleSessionDelete}
                  onSessionRename={handleSessionRename}
                />
              </div>
            }
          />
          {/* History Route */}
          <Route 
            path="/history" 
            element={
              <History 
                sessions={sessions}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
