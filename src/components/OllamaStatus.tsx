import { useEffect, useState } from 'react';
import { getOllamaStatus } from '../services/api';
import type { OllamaStatus, OllamaModel } from '../lib/ollama/types';

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

function ModelInfo({ model }: { model: OllamaModel }) {
  const contextSize = model.details?.context_length;
  const paramSize = model.details?.parameter_size;
  const quant = model.details?.quantization_level;

  console.log('Model details:', { contextSize, paramSize, quant });

  return (
    <span title={`Parameters: ${paramSize || 'Unknown'}${quant ? `, Quantization: ${quant}` : ''}`}>
      {model.name}
      {contextSize ? ` (${formatNumber(contextSize)} tokens)` : ''}
    </span>
  );
}

export function OllamaStatus() {
  const [status, setStatus] = useState<OllamaStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setIsLoading(true);
        const result = await getOllamaStatus();
        console.log('Status result:', result);
        setStatus(result);
      } catch (error) {
        console.error('Failed to get Ollama status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial check
    checkStatus();

    // Refresh every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!status && !isLoading) return null;

  // Debug output
  if (status?.models) {
    console.log('Models with details:', status.models.map(m => ({
      name: m.name,
      contextLength: m.details?.context_length,
      paramSize: m.details?.parameter_size,
      quant: m.details?.quantization_level
    })));
  }

  return (
    <div style={{ padding: '8px', fontSize: '14px', color: '#666' }}>
      {isLoading ? (
        <div>Checking Ollama status...</div>
      ) : status?.isResponding ? (
        <>
          <div>
            Status: Online (HTTP {status.statusCode})
            {status.systemInfo?.context_window && (
              <span style={{ marginLeft: '8px', color: '#888' }}>
                • System Context: {formatNumber(status.systemInfo.context_window)} tokens
                {status.systemInfo.gpu_memory && ` • GPU Memory: ${status.systemInfo.gpu_memory}`}
              </span>
            )}
          </div>
          <div>
            Default Model: {status.models?.find(m => m.name === status.defaultModel) ? (
              <ModelInfo model={status.models.find(m => m.name === status.defaultModel)!} />
            ) : status.defaultModel}
          </div>
          <div>
            Available Models: {status.models?.map((model, idx) => (
              <span key={model.name}>
                <ModelInfo model={model} />
                {idx < (status.models?.length ?? 0) - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        </>
      ) : (
        <div style={{ whiteSpace: 'pre-line' }}>
          Status: Offline
          {status?.error && (
            <div style={{ marginTop: '4px' }}>
              {status.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 