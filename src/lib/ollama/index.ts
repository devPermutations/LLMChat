/**
 * Ollama TypeScript Client
 * A strongly-typed client for interacting with local Ollama instances
 */

export { OllamaClient } from './client';
export * from './types';

// Create a default client instance
import { OllamaClient } from './client';
export const createClient = (config = {}) => new OllamaClient(config); 