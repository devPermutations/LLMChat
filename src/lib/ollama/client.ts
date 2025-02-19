/**
 * Ollama API Client
 * A TypeScript client for interacting with a local Ollama instance
 */

import axios, { AxiosInstance } from 'axios';
import { env } from '../../config/env';
import { OllamaConfig, GenerateRequestOptions, GenerateResponse, OllamaError, OllamaStatus } from './types';

export class OllamaClient {
  private api: AxiosInstance;
  private config: OllamaConfig;

  constructor(config: Partial<OllamaConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl ?? env.VITE_OLLAMA_CLIENT_DEFAULT_URL,
      defaultModel: config.defaultModel ?? env.VITE_OLLAMA_CLIENT_DEFAULT_MODEL,
      timeout: config.timeout ?? env.VITE_OLLAMA_CLIENT_DEFAULT_TIMEOUT,
    };

    this.api = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: this.config.timeout,
    });
  }

  /**
   * Check the status of the Ollama instance and available models
   * @returns Promise with the status information
   */
  async getStatus(): Promise<OllamaStatus> {
    try {
      // Check if Ollama is responding
      const healthCheck = await this.api.get('/api/tags');

      if (healthCheck.status !== 200) {
        return {
          isResponding: false,
          statusCode: healthCheck.status,
          error: 'Ollama server is not responding properly',
        };
      }

      // Get list of models
      const modelsData = healthCheck.data;
      console.log('Initial models data from /api/tags:', modelsData);
      
      // Fetch detailed information for each model
      const modelsWithDetails = await Promise.all(
        (modelsData.models ?? []).map(async (model: any) => {
          try {
            // Get detailed model information
            console.log(`Fetching details for model ${model.name}...`);
            const modelInfo = await this.api.post('/api/show', {
              name: model.name
            });
            
            console.log(`Received details for model ${model.name}:`, modelInfo.data);
            
            if (modelInfo.status === 200) {
              const details = modelInfo.data;
              return {
                name: model.name,
                size: model.size ?? 0,
                digest: model.digest ?? '',
                modified_at: model.modified_at ?? new Date().toISOString(),
                details: {
                  parameter_size: details.parameters,
                  quantization_level: details.quantization,
                  context_length: details.context_window || details.context_length,
                },
              };
            }
          } catch (error: any) {
            console.error(`Failed to fetch details for model ${model.name}:`, error);
            if (error.response?.data) {
              console.log('Error response:', error.response.data);
            }
          }
          
          // Fallback if detailed info fetch fails
          console.log(`Using fallback data for model ${model.name}:`, model);
          return {
            name: model.name,
            size: model.size ?? 0,
            digest: model.digest ?? '',
            modified_at: model.modified_at ?? new Date().toISOString(),
            details: {
              parameter_size: model.parameter_size,
              quantization_level: model.quantization_level,
              context_length: model.context_window || model.context_length,
            },
          };
        })
      );

      // Get system information from the first model's detailed info
      const firstModel = modelsWithDetails[0];
      console.log('First model details:', firstModel);
      
      const systemInfo = firstModel ? {
        context_window: firstModel.details?.context_length,
      } : undefined;

      console.log('System info:', systemInfo);

      const status = {
        isResponding: true,
        statusCode: healthCheck.status,
        models: modelsWithDetails,
        defaultModel: this.config.defaultModel,
        systemInfo,
      };

      console.log('Final status:', status);
      return status;
    } catch (error) {
      return {
        isResponding: false,
        error: `Ollama server is not running. Please follow these steps:

1. Download Ollama from https://ollama.ai
2. Install Ollama on your system
3. Open a terminal and run: ollama serve
4. Download a model by running: ollama pull ${this.config.defaultModel}
5. Refresh this page`,
      };
    }
  }

  /**
   * Generate a response from the model
   * @param options - Generation request options
   * @returns Promise with the generated response
   */
  async generate(options: GenerateRequestOptions): Promise<string> {
    const { model = this.config.defaultModel, prompt, onPartialResponse, signal } = options;

    try {
      // Make streaming request to Ollama API
      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: true,
        }),
        signal,
      });

      if (!response.ok || !response.body) {
        throw this.createError(`HTTP error! status: ${response.status}`, response.status);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line) as GenerateResponse;
              if (data.response) {
                fullResponse += data.response;
                onPartialResponse?.(data.response);
              }
            } catch (e) {
              console.error('Error parsing stream line:', e);
            }
          }
        }
      }

      return fullResponse;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404) {
          throw this.createError(`Model ${model} not found. Please ensure it's downloaded.`, status);
        }
        if (error.code === 'ECONNABORTED') {
          throw this.createError('Request timed out. The model might be busy.');
        }
        throw this.createError(error.message, status, error.response?.data);
      }

      throw this.createError(
        error instanceof Error ? error.message : 'Failed to generate response'
      );
    }
  }

  /**
   * Create a standardized error object
   */
  private createError(message: string, status?: number, data?: unknown): OllamaError {
    const error = new Error(message) as OllamaError;
    error.status = status;
    error.data = data;
    return error;
  }

  /**
   * Get the current configuration
   */
  getConfig(): OllamaConfig {
    return { ...this.config };
  }
} 