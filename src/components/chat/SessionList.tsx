import { Session } from '../../types/chat';

interface SessionListProps {
  sessions: Session[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
}

const SessionList = ({
  sessions,
  currentSessionId,
  onSessionSelect,
}: SessionListProps) => {
  return (
    <div className="fixed right-0 top-0 h-full w-64 bg-gray-900 p-4 overflow-y-auto">
      <div className="space-y-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`
              p-2 rounded-lg cursor-pointer
              ${currentSessionId === session.id ? 'bg-gray-700' : 'bg-gray-800'}
              hover:bg-gray-700 transition-colors
            `}
            onClick={() => onSessionSelect(session.id)}
          >
            <span className="text-gray-300">{session.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionList; 