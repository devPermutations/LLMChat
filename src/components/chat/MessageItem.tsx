/**
 * MessageItem Component
 * Renders a single chat message with different styles for user and assistant messages.
 * Supports formatting of special content blocks like think blocks and markdown-style formatting.
 */
import { MessageItemProps } from '../../types/chat';

const MessageItem = ({ message }: MessageItemProps) => {
  // Determine if the message is from the user
  const isUser = message.role === 'user';

  // Render user message with right-aligned blue bubbles
  if (isUser) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', padding: '8px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          {/* Timestamp display */}
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
          {/* Message bubble */}
          <div style={{
            backgroundColor: '#2563eb', // Blue background
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

  /**
   * Formats special content blocks within assistant messages
   * Handles:
   * - <think> blocks with custom styling
   * - Headers (###)
   * - Bold text (**)
   * - Bullet points (• or -)
   * - Line breaks and paragraphs
   */
  const formatThinkBlocks = (content: string) => {
    // Format <think> blocks with custom colors
    let formattedContent = content
      .replace(
        /<think>/g, 
        '<span style="color: #34d399; font-weight: 600;">&lt;think&gt;</span><div style="color: #fde047; padding: 4px 12px; margin: 0; white-space: pre-wrap;">'
      )
      .replace(
        /<\/think>/g, 
        '</div>\n<span style="color: #34d399; font-weight: 600;">&lt;/think&gt;</span>'
      );

    // Apply additional formatting
    formattedContent = formattedContent
      // Format headers
      .replace(/###\s+([^#\n]+)/g, '<div style="color: #26252a; font-weight: 600; margin-top: 1em;">$1</div>')
      // Format bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Format bullet points (•)
      .replace(/•\s+([^\n]+)/g, '<div style="margin-left: 1em;">• $1</div>')
      // Format bullet points (-)
      .replace(/(?:^|\n)-\s+([^\n]+)/g, '<div style="margin-left: 1em;">• $1</div>')
      // Convert newlines to <br />
      .replace(/\n/g, '<br />')
      // Convert double line breaks to paragraphs
      .replace(/<br \/><br \/>/g, '</p><p>')
      // Wrap initial content in paragraph tags
      .replace(/^(.+?)(?=<\/p>|$)/s, '<p>$1</p>');

    // Return formatted content with dangerouslySetInnerHTML
    return (
      <div 
        className="text-gray-100 whitespace-pre-line"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    );
  };

  // Render assistant message with left-aligned gray bubbles
  return (
    <div style={{ width: '100%', display: 'flex', padding: '8px 16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Timestamp display */}
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
        {/* Message bubble with formatted content */}
        <div style={{
          backgroundColor: '#26252a', // Dark background
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