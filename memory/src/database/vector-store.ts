import { Chroma } from '@langchain/community/vectorstores/chroma';
import { Document } from '@langchain/core/documents';
import { IVectorStore, MemoryEntry, MemoryConfig } from '../core/types';
import { OllamaEmbeddings } from '../core/ollama-embeddings';

interface ChromaMetadata {
  id: string;
  tags: string[];
  metadata_json: string;
  created_at: string;
  updated_at: string;
  namespace: string;
}

export class ChromaVectorStore implements IVectorStore {
  private vectorStore: Chroma | null = null;
  private embeddings: OllamaEmbeddings;
  private namespace: string;

  constructor(config: MemoryConfig) {
    this.embeddings = new OllamaEmbeddings({
      baseUrl: config.ollamaBaseUrl,
      model: config.ollamaModel,
    });
    this.namespace = config.namespace;
    this.initialize();
  }

  private async initialize() {
    try {
      // Create a new ChromaDB instance or get existing one
      // Use namespace as collection name to isolate different users' memories
      const collectionName = `memory-store-${this.namespace}`;
      
      this.vectorStore = await Chroma.fromExistingCollection(
        this.embeddings,
        { 
          collectionName,
          collectionMetadata: {
            namespace: this.namespace,
            hnsw_space: "cosine" // Use cosine similarity
          }
        }
      );
    } catch (error) {
      // If collection doesn't exist, create a new one
      const collectionName = `memory-store-${this.namespace}`;
      
      this.vectorStore = await Chroma.fromDocuments(
        [], // Start with empty documents
        this.embeddings,
        { 
          collectionName,
          collectionMetadata: {
            namespace: this.namespace,
            hnsw_space: "cosine"
          }
        }
      );
    }
  }

  async upsert(entries: MemoryEntry[]): Promise<void> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    try {
      const documents = entries.map(entry => new Document<ChromaMetadata>({
        pageContent: entry.content,
        metadata: {
          id: entry.id,
          tags: entry.tags,
          metadata_json: JSON.stringify(entry.metadata),
          created_at: entry.created_at.toISOString(),
          updated_at: entry.updated_at.toISOString(),
          namespace: this.namespace,
        },
      }));

      await this.vectorStore.addDocuments(documents);
    } catch (error) {
      console.error('Failed to upsert vectors:', error);
      throw error;
    }
  }

  async search(vector: number[], limit: number): Promise<MemoryEntry[]> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    try {
      // Add namespace filter to only search within user's memories
      const results = await this.vectorStore.similaritySearchVectorWithScore(
        vector,
        limit,
        { namespace: this.namespace }
      );

      return results.map(([doc, _score]) => ({
        id: doc.metadata.id,
        content: doc.pageContent,
        embedding: vector, // Note: ChromaDB doesn't return the original embedding
        tags: doc.metadata.tags,
        metadata: JSON.parse(doc.metadata.metadata_json),
        created_at: new Date(doc.metadata.created_at),
        updated_at: new Date(doc.metadata.updated_at),
      }));
    } catch (error) {
      console.error('Failed to search vectors:', error);
      throw error;
    }
  }

  async delete(ids: string[]): Promise<void> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    try {
      // Only delete within the user's namespace
      await Promise.all(
        ids.map(id => this.vectorStore!.delete({ 
          filter: { 
            id,
            namespace: this.namespace 
          }
        }))
      );
    } catch (error) {
      console.error('Failed to delete vectors:', error);
      throw error;
    }
  }

  // New method to delete all memories for a namespace
  async deleteNamespace(): Promise<void> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    try {
      await this.vectorStore.delete({
        filter: { namespace: this.namespace }
      });
    } catch (error) {
      console.error('Failed to delete namespace:', error);
      throw error;
    }
  }
} 