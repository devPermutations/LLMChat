import { MessageItemProps } from '../../types/chat';

const MessageItem = ({ message }: MessageItemProps) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', padding: '8px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{
            fontSize: '8px',
            color: '#9ca3af',
            marginBottom: '4px',
            marginRight: '4px'
          }}>
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit'
            })}
          </div>
          <div style={{
            backgroundColor: '#2563eb',
            border: '1px solid #3b82f6',
            borderRadius: '12px',
            padding: '8px 16px',
            color: 'white',
            maxWidth: '80%'
          }}>
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // For non-user messages (assistant)
  const formatThinkBlocks = (content: string) => {
    let formattedContent = content
      .replace(
        /<think>/g, 
        '<span style="color: #34d399; font-weight: 600;">&lt;think&gt;</span>\n<div style="color: #fde047; padding: 4px 12px; margin: 0; white-space: pre-wrap;">'
      )
      .replace(
        /<\/think>/g, 
        '</div>\n<span style="color: #34d399; font-weight: 600;">&lt;/think&gt;</span>'
      );

    formattedContent = formattedContent
      .replace(/###\s+([^#\n]+)/g, '<div style="color: #60a5fa; font-weight: 600; margin-top: 1em;">$1</div>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/•\s+([^\n]+)/g, '<div style="margin-left: 1em;">• $1</div>')
      .replace(/(?:^|\n)-\s+([^\n]+)/g, '<div style="margin-left: 1em;">• $1</div>')
      .replace(/\n/g, '<br />')
      .replace(/<br \/><br \/>/g, '</p><p>')
      .replace(/^(.+?)(?=<\/p>|$)/s, '<p>$1</p>');

    return (
      <div 
        className="text-gray-100 whitespace-pre-line"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    );
  };

  return (
    <div style={{ width: '100%', display: 'flex', padding: '8px 16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{
          fontSize: '8px',
          color: '#9ca3af',
          marginBottom: '4px',
          marginLeft: '4px'
        }}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit'
          })}
        </div>
        <div style={{
          backgroundColor: '#374151',
          border: '1px solid #4b5563',
          borderRadius: '12px',
          padding: '8px 16px',
          color: 'white',
          maxWidth: '80%'
        }}>
          {formatThinkBlocks(message.content)}
        </div>
      </div>
    </div>
  );
};

export default MessageItem; 