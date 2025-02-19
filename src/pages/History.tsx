/**
 * History Component
 * Displays analytics and history for chat sessions including:
 * - Daily token usage chart
 * - Token usage by model
 * - Token usage by role (user/assistant)
 * - List of chat sessions with detailed statistics
 */

import { useEffect, useState } from 'react';
import { DatabaseService } from '../services/database';
import { Session } from '../types/chat';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register required Chart.js components for the line chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Interface definitions for different types of token usage data
interface TokenUsageByDay {
  date: string;
  tokens: number;
}

interface TokenUsageByModel {
  model: string;
  tokens: number;
}

interface TokenUsageByRole {
  role: string;
  tokens: number;
}

// Interface for detailed session statistics
interface SessionStats {
  messageCount: number;
  totalTokens: number;
  userTokens: number;
  assistantTokens: number;
  duration: number;
}

interface HistoryProps {
  sessions: Session[];
}

const History = ({ sessions }: HistoryProps) => {
  // Initialize database service and state management
  const [db] = useState(() => new DatabaseService());
  const [tokensByDay, setTokensByDay] = useState<TokenUsageByDay[]>([]);
  const [tokensByModel, setTokensByModel] = useState<TokenUsageByModel[]>([]);
  const [tokensByRole, setTokensByRole] = useState<TokenUsageByRole[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);

  // Load initial data on component mount
  useEffect(() => {
    const loadData = async () => {
      // Fetch all data concurrently for better performance
      const [tokensByDayData, tokensByModelData, tokensByRoleData] = await Promise.all([
        db.getTokenUsageByDay(),
        db.getTokenUsageByModel(),
        db.getTokenUsageByRole()
      ]);

      // Update state with fetched data
      setTokensByDay(tokensByDayData);
      setTokensByModel(tokensByModelData);
      setTokensByRole(tokensByRoleData);
    };

    loadData();
  }, [db]);

  // Load detailed stats when a session is selected
  useEffect(() => {
    if (selectedSession) {
      const loadSessionStats = async () => {
        const stats = await db.getSessionStats(selectedSession);
        setSessionStats(stats);
      };

      loadSessionStats();
    }
  }, [db, selectedSession]);

  // Prepare data for the daily usage chart
  const dailyUsageData = {
    labels: tokensByDay.map(d => d.date),
    datasets: [
      {
        label: 'Daily Token Usage',
        data: tokensByDay.map(d => d.tokens),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  // Helper function to format duration from seconds to hours and minutes
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Add this new handler
  const handleWipeDatabase = async () => {
    if (window.confirm('Are you sure you want to wipe all chat history? This action cannot be undone.')) {
      try {
        await db.wipeDatabase();
        // Reset all state
        setTokensByDay([]);
        setTokensByModel([]);
        setTokensByRole([]);
        setSelectedSession(null);
        setSessionStats(null);
      } catch (error) {
        console.error('Failed to wipe database:', error);
        alert('Failed to wipe database. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">History</h1>
        <button
          onClick={handleWipeDatabase}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Wipe Database
        </button>
      </div>

      {/* Daily Usage Chart Section */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Daily Token Usage</h2>
        <div className="h-64">
          <Line 
            data={dailyUsageData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(255, 255, 255, 0.1)' },
                  ticks: { color: 'white' }
                },
                x: {
                  grid: { color: 'rgba(255, 255, 255, 0.1)' },
                  ticks: { color: 'white' }
                }
              },
              plugins: {
                legend: { labels: { color: 'white' } }
              }
            }}
          />
        </div>
      </div>

      {/* Token Usage Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Model Usage Statistics */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Usage by Model</h2>
          <div className="space-y-4">
            {tokensByModel.map(({ model, tokens }) => (
              <div key={model} className="flex justify-between items-center">
                <span className="text-gray-300">{model}</span>
                <span className="font-mono">{tokens.toLocaleString()} tokens</span>
              </div>
            ))}
          </div>
        </div>

        {/* Role Usage Statistics */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Usage by Role</h2>
          <div className="space-y-4">
            {tokensByRole.map(({ role, tokens }) => (
              <div key={role} className="flex justify-between items-center">
                <span className="text-gray-300">{role}</span>
                <span className="font-mono">{tokens.toLocaleString()} tokens</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session List Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Sessions</h2>
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
                <h3 className="font-semibold">{session.name}</h3>
                <span className="text-gray-400 ml-2">
                  {session.messages.length} messages - {session.totalTokens.toLocaleString()} tokens - {new Date(session.createdAt).toLocaleString()} - {session.model}
                </span>
              </div>

              {/* Detailed Session Statistics (shown when selected) */}
              {selectedSession === session.id && sessionStats && (
                <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Messages</p>
                    <p className="font-mono">{sessionStats.messageCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Duration</p>
                    <p className="font-mono">{formatDuration(sessionStats.duration)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">User Tokens</p>
                    <p className="font-mono">{sessionStats.userTokens.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Assistant Tokens</p>
                    <p className="font-mono">{sessionStats.assistantTokens.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History; 