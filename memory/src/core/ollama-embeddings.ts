import { Embeddings, EmbeddingsParams } from '@langchain/core/embeddings';
import { ollamaClient } from '../services/api';

interface OllamaEmbeddingsParams extends EmbeddingsParams {
  baseUrl?: string;
  model?: string;
}

export class OllamaEmbeddings extends Embeddings {
  private model: string;
  private baseUrl: string;

  constructor(params: OllamaEmbeddingsParams) {
    super(params);
    this.baseUrl = params.baseUrl || 'http://localhost:11434';
    this.model = params.model || 'all-mini';
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    const embeddings = await Promise.all(
      documents.map(doc => this.embedQuery(doc))
    );
    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    try {
      const response = await ollamaClient.generateEmbedding({
        model: this.model,
        prompt: text,
      });

      if (!response.embedding) {
        throw new Error('No embedding returned from Ollama');
      }

      return response.embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }
} 