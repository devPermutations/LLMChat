import { MessageItemProps } from '../../types/chat';
import { UserIcon, CommandLineIcon } from '@heroicons/react/24/solid';

const MessageItem = ({ message }: MessageItemProps) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex items-start gap-4 p-4 ${
        isUser ? 'bg-message-bg' : 'bg-chat-bg'
      }`}
    >
      <div className="flex-shrink-0">
        {isUser ? (
          <UserIcon className="h-6 w-6 text-blue-500" />
        ) : (
          <CommandLineIcon className="h-6 w-6 text-green-500" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <div className="text-sm font-medium text-gray-300">
          {isUser ? 'You' : 'Assistant'}
        </div>
        <div className="text-gray-100 whitespace-pre-wrap">{message.content}</div>
        <div className="text-xs text-gray-500">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default MessageItem; 