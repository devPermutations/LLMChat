import { useEffect, useState } from 'react';
import { getOllamaStatus } from '../services/api';
import type { OllamaStatus as OllamaStatusType, OllamaModel } from '../lib/ollama/types';

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

const ModelInfo = ({ model }: { model: OllamaModel }) => {
  const contextSize = model.details?.context_length;
  const paramSize = model.details?.parameter_size;
  const quant = model.details?.quantization_level;

  return (
    <span 
      className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
      title={`Size: ${formatNumber(model.size)} bytes${paramSize ? `, Parameters: ${paramSize}` : ''}${quant ? `, Quantization: ${quant}` : ''}`}
    >
      <span className="font-medium">{model.name}</span>
      {contextSize && (
        <span className="text-xs text-gray-500">
          ({formatNumber(contextSize)} tokens)
        </span>
      )}
    </span>
  );
};

export function OllamaStatus() {
  const [status, setStatus] = useState<OllamaStatusType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setIsLoading(true);
        const result = await getOllamaStatus();
        setStatus(result);
      } catch (error) {
        console.error('Failed to get Ollama status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!status && !isLoading) return null;

  return (
    <div className="p-4 space-y-2 text-sm bg-gray-50 rounded-lg">
      {isLoading ? (
        <div className="text-gray-600">Checking Ollama status...</div>
      ) : status?.isResponding ? (
        <>
          <div className="flex items-center gap-2 text-gray-700">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Status: Online (HTTP {status.statusCode})
            </span>
            {status.systemInfo?.context_window && (
              <span className="text-gray-500">
                • System Context: {formatNumber(status.systemInfo.context_window)} tokens
                {status.systemInfo.gpu_memory && ` • GPU Memory: ${status.systemInfo.gpu_memory}`}
              </span>
            )}
          </div>
          
          <div className="text-gray-700">
            <span className="font-medium">Default Model: </span>
            {status.models?.find(m => m.name === status.defaultModel) ? (
              <ModelInfo model={status.models.find(m => m.name === status.defaultModel)!} />
            ) : (
              <span className="text-gray-600">{status.defaultModel}</span>
            )}
          </div>

          <div className="text-gray-700">
            <span className="font-medium">Available Models: </span>
            <div className="flex flex-wrap gap-2 mt-1">
              {status.models?.map((model) => (
                <ModelInfo key={model.name} model={model} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            Status: Offline
          </div>
          {status?.error && (
            <div className="text-gray-600 whitespace-pre-line">
              {status.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 