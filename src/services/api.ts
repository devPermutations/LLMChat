/**
 * API service for interacting with the Ollama API
 * This module provides functionality for making requests to the Ollama language model service.
 */

import { env } from '../config/env';
import { createClient } from '../lib/ollama';

// Create an Ollama client instance with environment-based configuration
const ollamaClient = createClient({
  baseUrl: env.VITE_OLLAMA_API_URL,
  defaultModel: env.VITE_OLLAMA_DEFAULT_MODEL,
  timeout: env.VITE_OLLAMA_TIMEOUT_MS,
});

/**
 * Generates a response from the Ollama model using streaming
 * @param prompt - The input text prompt to send to the model
 * @param model - The name of the model to use (defaults to environment configuration)
 * @param onPartialResponse - Optional callback function to handle streaming responses
 * @param signal - Optional AbortSignal for cancelling the request
 * @returns Promise<string> - The complete generated response
 * @throws Error if the request fails or is aborted
 */
export const generateResponse = (
  prompt: string,
  model?: string,
  onPartialResponse?: (partial: string) => void,
  signal?: AbortSignal
) => {
  return ollamaClient.generate({
    prompt,
    model,
    onPartialResponse,
    signal,
  });
};

export default ollamaClient; 