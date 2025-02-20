import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define environment variable schema
const envSchema = z.object({
  OLLAMA_BASE_URL: z.string().default('http://localhost:11434'),
  OLLAMA_MODEL: z.string().default('all-mini'),
  MEMORY_NAMESPACE: z.string().default('default'),
  SIMILARITY_THRESHOLD: z.number().default(0.7),
  MAX_RESULTS: z.number().default(5),
  CHROMA_DB_PATH: z.string().default('./chroma_db'), // Local path for ChromaDB storage
});

// Parse and validate environment variables
export const env = envSchema.parse({
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
  OLLAMA_MODEL: process.env.OLLAMA_MODEL,
  MEMORY_NAMESPACE: process.env.MEMORY_NAMESPACE,
  SIMILARITY_THRESHOLD: process.env.SIMILARITY_THRESHOLD
    ? parseFloat(process.env.SIMILARITY_THRESHOLD)
    : undefined,
  MAX_RESULTS: process.env.MAX_RESULTS
    ? parseInt(process.env.MAX_RESULTS, 10)
    : undefined,
  CHROMA_DB_PATH: process.env.CHROMA_DB_PATH,
}); 