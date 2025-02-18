import { useState, KeyboardEvent, useEffect } from 'react';
import { ChatInputProps } from '../../types/chat';
import ModelSelector from './ModelSelector';

const ChatInput = ({ onSendMessage, onStop, isLoading = false }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('deepseek-r1:14b');

  useEffect(() => {
    // Fetch available models from Ollama
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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !isLoading) {
        onSendMessage(message.trim(), selectedModel);
        setMessage('');
      }
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'fixed', bottom: '32px', zIndex: 1000 }}>
      <div style={{ position: 'relative', width: '90ch', maxWidth: '90vw' }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Press Enter to send)"
          style={{
            width: '100%',
            height: '60px',
            padding: '16px 16px',
            backgroundColor: 'rgba(31, 41, 55, 0.95)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            resize: 'none',
            outline: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(8px)'
          }}
          disabled={isLoading}
        />
        
        {/* Control bar under the textbox */}
        <div className="flex items-center h-8 px-2 mt-2">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            models={models}
          />
          
          <button
            style={{
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
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'black'}
          >
            History
          </button>
          
          {isLoading && (
            <button
              onClick={onStop}
              style={{
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
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'black'}
            >
              Stop
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput; 