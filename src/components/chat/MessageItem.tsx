import { MessageItemProps } from '../../types/chat';

const MessageItem = ({ message }: MessageItemProps) => {
  const isUser = message.role === 'user';

  const formatThinkBlocks = (content: string) => {
    if (isUser) {
      return <span className="text-gray-100">{content}</span>;
    }

    // First handle the think blocks
    let formattedContent = content
      .replace(
        /<think>/g, 
        '<span style="color: #34d399; font-weight: 600;">&lt;think&gt;</span><div style="color: #fde047; background-color: rgba(234, 179, 8, 0.1); padding: 8px 12px; border-radius: 6px; margin: 4px 0; white-space: pre-wrap;">'
      )
      .replace(
        /<\/think>/g, 
        '</div><span style="color: #34d399; font-weight: 600;">&lt;/think&gt;</span>\n\n\n'
      );

    // Then handle general text formatting
    formattedContent = formattedContent
      // Section headers (###)
      .replace(/###\s+([^#\n]+)/g, '<div style="color: #60a5fa; font-weight: 600; margin-top: 1em;">$1</div>')
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Bullet points with •
      .replace(/•\s+([^\n]+)/g, '<div style="margin-left: 1em;">• $1</div>')
      // Bullet points with -
      .replace(/(?:^|\n)-\s+([^\n]+)/g, '<div style="margin-left: 1em;">• $1</div>')
      // Convert single newlines to breaks to preserve formatting
      .replace(/\n/g, '<br />')
      // Restore double newlines for paragraph breaks
      .replace(/<br \/><br \/>/g, '</p><p>')
      // Wrap everything in paragraphs for proper spacing
      .replace(/^(.+?)(?=<\/p>|$)/s, '<p>$1</p>');

    return (
      <div 
        className="text-gray-100 whitespace-pre-line space-y-2"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    );
  };

  return (
    <div
      className={`px-4 py-3 ${
        isUser ? 'bg-message-bg' : 'bg-chat-bg'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-400">
            {isUser ? 'You' : 'Assistant'}
          </div>
          <div className="leading-relaxed">
            {formatThinkBlocks(message.content)}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem; 