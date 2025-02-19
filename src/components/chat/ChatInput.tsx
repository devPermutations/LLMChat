/**
 * ChatInput Component
 * Provides the input interface for the chat application, including:
 * - Message input textarea
 * - Model selection dropdown
 * - History and Stop generation buttons
 * - Handles message submission and model switching
 * - Manages chat sessions and context window
 */
import { useState, KeyboardEvent, useEffect } from 'react';
import { ChatInputProps } from '../../types/chat';
import ModelSelector from './ModelSelector';

const ChatInput = ({ 
  onSendMessage, 
  onStop, 
  onNewSession, 
  isLoading = false, 
  currentSession,
  onToggleStatus
}: ChatInputProps) => {
  // Local state management
  const [message, setMessage] = useState(''); // Current message text
  const [models, setModels] = useState<string[]>([]); // Available AI models
  const [selectedModel, setSelectedModel] = useState(currentSession?.model || 'deepseek-r1:14b'); // Currently selected model

  // Fetch available models on component mount
  useEffect(() => {
    fetch('http://localhost:11434/api/tags')
      .then(response => response.json())
      .then(data => {
        if (data.models) {
          const modelNames = data.models.map((model: any) => model.name);
          setModels(modelNames);
        }
      })
      .catch(error => console.error('Error fetching models:', error));
  }, []);

  /**
   * Handle keyboard events in the textarea
   * - Submits message on Enter (without shift)
   * - Allows new lines with Shift+Enter
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !isLoading) {
        onSendMessage(message.trim(), selectedModel);
        setMessage('');
      }
    }
  };

  // Common button style
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

  return (
    // Fixed position container at the bottom of the chat
    <div style={{ 
      width: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      position: 'fixed', 
      bottom: '32px', 
      zIndex: 1000,
      pointerEvents: 'none' // This ensures clicks pass through the container's empty space
    }}>
      {/* Input container with max width constraint */}
      <div style={{ 
        position: 'relative', 
        width: '90ch', 
        maxWidth: '90vw',
        pointerEvents: 'auto' // Re-enable pointer events for the actual content
      }}>
        {/* Message input textarea */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Press Enter to send)"
          style={{
            width: '100%',
            height: '60px',
            padding: '16px 16px',
            backgroundColor: '#26252a',
            color: 'white',
            border: '1px solid #4b5563',
            borderRadius: '12px',
            resize: 'none',
            outline: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(8px)'
          }}
          disabled={isLoading}
        />
        
        {/* Control bar: Model selector and action buttons */}
        <div style={{ position: 'absolute', left: '16px', bottom: '12px', display: 'flex', alignItems: 'center' }}>
          {/* Model selection dropdown */}
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            models={models}
          />
          
          {/* History button - now using Link */}
          <a
            href="/history"
            style={{
              ...buttonStyle,
              textDecoration: 'none',
              display: 'inline-block'
            }}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            History
          </a>

          {/* Status button */}
          <button
            onClick={() => onToggleStatus?.()}
            style={buttonStyle}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            Status
          </button>

          {/* New button */}
          <button
            onClick={onNewSession}
            style={buttonStyle}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            New
          </button>
          
          {/* Stop generation button - only shown while loading */}
          {isLoading && (
            <button
              onClick={onStop}
              style={buttonStyle}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              Stop
            </button>
          )}

          {/* Session stats */}
          {currentSession && (
            <span style={{
              fontSize: '8px',
              color: '#9CA3AF',
              marginLeft: '8px'
            }}>
              {currentSession.messages.length} messages - {currentSession.totalTokens.toLocaleString()} tokens
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput; 