/**
 * Ollama API Client
 * A TypeScript client for interacting with a local Ollama instance
 */

import axios, { AxiosInstance } from 'axios';
import { OllamaConfig, GenerateRequestOptions, GenerateResponse, OllamaError } from './types';

export class OllamaClient {
  private api: AxiosInstance;
  private config: OllamaConfig;

  constructor(config: Partial<OllamaConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl ?? 'http://localhost:11434',
      defaultModel: config.defaultModel ?? 'deepseek-r1:14b',
      timeout: config.timeout ?? 60000,
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