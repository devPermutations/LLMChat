/**
 * Type definitions for the Ollama client
 */

export interface OllamaConfig {
  baseUrl: string;
  defaultModel: string;
  timeout: number;
}

export interface GenerateRequestOptions {
  model?: string;
  prompt: string;
  stream?: boolean;
  onPartialResponse?: (partial: string) => void;
  signal?: AbortSignal;
}

export interface GenerateResponse {
  model: string;
  response: string;
  done: boolean;
}

export interface OllamaError extends Error {
  status?: number;
  data?: unknown;
} 