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

export interface OllamaModelDetails {
  parameter_size?: string;
  quantization_level?: string;
  context_length?: number;
}

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
  details?: OllamaModelDetails;
}

export interface OllamaSystemInfo {
  context_window?: number;
  gpu_memory?: string;
  total_memory?: string;
}

export interface OllamaStatus {
  isResponding: boolean;
  statusCode?: number;
  models?: OllamaModel[];
  defaultModel?: string;
  error?: string;
  systemInfo?: OllamaSystemInfo;
} 