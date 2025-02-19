/**
 * OllamaStatus Component
 * Displays the current status of the Ollama server and available models.
 * Shows connection status, system information, and model details in a clean UI.
 */
import { useEffect, useState } from 'react';
import { getOllamaStatus } from '../services/api';
import type { OllamaStatus as OllamaStatusType, OllamaModel } from '../lib/ollama/types';

interface OllamaStatusProps {
  isVisible: boolean;
}

/**
 * Helper function to format large numbers with commas
 * e.g., 1000000 -> "1,000,000"
 */
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * ModelInfo Component
 * Renders information about a single model, including:
 * - Model name
 * - Context window size
 * - Parameter count and quantization (in tooltip)
 */
const ModelInfo = ({ model }: { model: OllamaModel }) => {
  const contextSize = model.details?.context_length;
  const paramSize = model.details?.parameter_size;
  const quant = model.details?.quantization_level;

  return (
    <span 
      className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-300"
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

export function OllamaStatus({ isVisible }: OllamaStatusProps) {
  // State management for Ollama status and loading state
  const [status, setStatus] = useState<OllamaStatusType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effect to periodically check Ollama status
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

    // Initial check and set up polling interval
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Don't render anything if there's no status and we're not loading or if not visible
  if (!isVisible || (!status && !isLoading)) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-4 px-4">
      <div className="p-4 space-y-2 text-sm bg-[#26252a] rounded-lg border border-[#4b5563] shadow-lg">
        {isLoading ? (
          // Loading state display
          <div className="text-gray-400">Checking Ollama status...</div>
        ) : status?.isResponding ? (
          // Online status with server information
          <>
            {/* Connection status indicator */}
            <div className="flex items-center gap-2 text-gray-400">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Status: Online (HTTP {status.statusCode})
              </span>
            </div>
            
            {/* Default model display */}
            <div className="text-gray-400">
              <span className="font-medium">Default Model: </span>
              {status.models?.find(m => m.name === status.defaultModel) ? (
                <ModelInfo model={status.models.find(m => m.name === status.defaultModel)!} />
              ) : (
                <span className="text-gray-500">{status.defaultModel}</span>
              )}
            </div>

            {/* Available models list */}
            <div className="text-gray-400">
              <span className="font-medium">Available Models: </span>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {status.models?.map((model, index) => (
                  <div key={model.name} className="flex items-center">
                    <ModelInfo model={model} />
                    {index < (status.models?.length ?? 0) - 1 && (
                      <span className="text-gray-500 ml-2">•</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          // Offline status with error message
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-400">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              Status: Offline
            </div>
            {status?.error && (
              <div className="text-gray-400 whitespace-pre-line">
                {status.error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 