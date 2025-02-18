/**
 * Environment configuration with validation
 * This module ensures all required environment variables are present and properly typed
 */

import { z } from 'zod';

// Environment variable schema with validation
const envSchema = z.object({
  // API Configuration
  VITE_OLLAMA_API_URL: z.string().url(),
  VITE_OLLAMA_DEFAULT_MODEL: z.string(),
  VITE_OLLAMA_TIMEOUT_MS: z.string().transform((val) => parseInt(val, 10)),

  // Client Defaults
  VITE_OLLAMA_CLIENT_DEFAULT_URL: z.string().url(),
  VITE_OLLAMA_CLIENT_DEFAULT_MODEL: z.string(),
  VITE_OLLAMA_CLIENT_DEFAULT_TIMEOUT: z.string().transform((val) => parseInt(val, 10)),
});

// Validate environment variables
const parseEnvVars = () => {
  try {
    return envSchema.parse({
      // API Configuration
      VITE_OLLAMA_API_URL: import.meta.env.VITE_OLLAMA_API_URL,
      VITE_OLLAMA_DEFAULT_MODEL: import.meta.env.VITE_OLLAMA_DEFAULT_MODEL,
      VITE_OLLAMA_TIMEOUT_MS: import.meta.env.VITE_OLLAMA_TIMEOUT_MS,

      // Client Defaults
      VITE_OLLAMA_CLIENT_DEFAULT_URL: import.meta.env.VITE_OLLAMA_CLIENT_DEFAULT_URL,
      VITE_OLLAMA_CLIENT_DEFAULT_MODEL: import.meta.env.VITE_OLLAMA_CLIENT_DEFAULT_MODEL,
      VITE_OLLAMA_CLIENT_DEFAULT_TIMEOUT: import.meta.env.VITE_OLLAMA_CLIENT_DEFAULT_TIMEOUT,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => err.path.join('.')).join(', ');
      throw new Error(
        `Missing or invalid environment variables: ${missingVars}. Please check your .env file.`
      );
    }
    throw error;
  }
};

// Export validated environment variables
export const env = parseEnvVars(); 