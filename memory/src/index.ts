import { env } from './config/env';
import { MemoryProcessor } from './core/memory-processor';
import { ChromaVectorStore } from './database/vector-store';
import { InMemoryTagManager } from './tags/tag-manager';

export { MemoryProcessor } from './core/memory-processor';
export { ChromaVectorStore } from './database/vector-store';
export { InMemoryTagManager } from './tags/tag-manager';
export * from './core/types';

// Create and export a default configured memory system
const vectorStore = new ChromaVectorStore({
  ollamaBaseUrl: env.OLLAMA_BASE_URL,
  ollamaModel: env.OLLAMA_MODEL,
  namespace: env.MEMORY_NAMESPACE,
  similarityThreshold: env.SIMILARITY_THRESHOLD,
  maxResults: env.MAX_RESULTS,
});

const tagManager = new InMemoryTagManager();

export const memorySystem = new MemoryProcessor(vectorStore, tagManager, {
  ollamaBaseUrl: env.OLLAMA_BASE_URL,
  ollamaModel: env.OLLAMA_MODEL,
  namespace: env.MEMORY_NAMESPACE,
  similarityThreshold: env.SIMILARITY_THRESHOLD,
  maxResults: env.MAX_RESULTS,
}); 