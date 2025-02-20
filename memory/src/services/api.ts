import { z } from 'zod';

const EmbeddingResponseSchema = z.object({
  embedding: z.array(z.number()),
});

type OllamaEmbeddingResponse = z.infer<typeof EmbeddingResponseSchema>;

interface OllamaClient {
  generateEmbedding(params: {
    model: string;
    prompt: string;
  }): Promise<OllamaEmbeddingResponse>;
}

class OllamaAPIClient implements OllamaClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async generateEmbedding(params: {
    model: string;
    prompt: string;
  }): Promise<OllamaEmbeddingResponse> {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model,
        prompt: params.prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const rawData = await response.json();
    const validatedData = EmbeddingResponseSchema.parse(rawData);
    return validatedData;
  }
}

export const ollamaClient = new OllamaAPIClient(); 