import { Session } from '../../types/chat';

interface SessionListProps {
  sessions: Session[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onSessionDelete: (sessionId: string) => void;
  onSessionRename: (sessionId: string, newName: string) => void;
}

const SessionList = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onSessionDelete,
  onSessionRename
}: SessionListProps) => {
  return (
    <div className="fixed right-0 top-0 h-full w-64 bg-gray-900 p-4 overflow-y-auto">
      <div className="space-y-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`
              p-2 rounded-lg cursor-pointer flex justify-end
              ${currentSessionId === session.id ? 'bg-gray-700' : 'bg-gray-800'}
              hover:bg-gray-700 transition-colors
            `}
            onClick={() => onSessionSelect(session.id)}
          >
            <div className="flex items-center space-x-2">
              <button
                className="text-gray-400 hover:text-white p-1 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  const newName = prompt('Enter new name:', session.name);
                  if (newName) onSessionRename(session.id, newName);
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              
              <button
                className="text-gray-400 hover:text-red-500 p-1 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this chat?')) {
                    onSessionDelete(session.id);
                  }
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionList; 