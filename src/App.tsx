/**
 * Main Application Component
 * Handles the overall application structure, routing, and session management.
 * Features:
 * - Chat interface with session management
 * - History page for analytics
 * - Navigation and status display
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import ChatContainer from './components/chat/ChatContainer';
import History from './pages/History';
import { SessionManager } from './services/sessionManager';
import { Session } from './types/chat';

const AppContent = () => {
  const [sessionManager] = useState(() => new SessionManager());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();

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
        
        // Check for session ID in URL parameters
        const sessionId = searchParams.get('session');
        if (sessionId) {
          const session = loadedSessions.find(s => s.id === sessionId);
          if (session) {
            setCurrentSession(session);
            sessionManager.switchSession(session.id);
            return;
          }
        }
        
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
  }, [sessionManager, searchParams]);

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
    <div className="flex flex-col min-h-screen bg-gray-900 text-white overflow-x-hidden">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-800 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
            </div>
          </div>
        </div>
      </nav>

      {/* Application Routes */}
      <Routes>
        {/* Main Chat Route */}
        <Route 
          path="/" 
          element={
            <div className="flex-1">
              <ChatContainer 
                sessionManager={sessionManager}
                currentSession={currentSession}
                onNewSession={handleNewSession}
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
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
