import { IMemoryProcessor, ITagManager, IVectorStore, MemoryEntry, MemoryProcessingResult, MemoryConfig } from './types';
import { OllamaEmbeddings } from './ollama-embeddings';
import { v4 as uuidv4 } from 'uuid';

export class MemoryProcessor implements IMemoryProcessor {
  private embeddings: OllamaEmbeddings;
  private vectorStore: IVectorStore;
  private tagManager: ITagManager;
  private similarityThreshold: number;
  private maxResults: number;

  constructor(
    vectorStore: IVectorStore,
    tagManager: ITagManager,
    config: MemoryConfig
  ) {
    this.embeddings = new OllamaEmbeddings({
      baseUrl: config.ollamaBaseUrl,
      model: config.ollamaModel,
    });
    this.vectorStore = vectorStore;
    this.tagManager = tagManager;
    this.similarityThreshold = config.similarityThreshold;
    this.maxResults = config.maxResults;
  }

  async processPrompt(prompt: string): Promise<MemoryProcessingResult> {
    // Generate embedding for the prompt
    const promptEmbedding = await this.embeddings.embedQuery(prompt);

    // Search for related memories
    const relatedMemories = await this.vectorStore.search(
      promptEmbedding,
      this.maxResults
    );

    // Extract potential tags from the prompt
    const tags = await this.extractTags(prompt);

    // Create new memory if tags were found
    const newMemories: MemoryEntry[] = [];
    if (tags.length > 0) {
      const newMemory = await this.createMemory(prompt, tags);
      newMemories.push(newMemory);
    }

    // Augment the prompt with related memories
    const augmentedPrompt = this.augmentPrompt(prompt, relatedMemories);

    return {
      augmentedPrompt,
      relatedMemories,
      newMemories,
    };
  }

  async createMemory(content: string, tags: string[]): Promise<MemoryEntry> {
    const embedding = await this.embeddings.embedQuery(content);

    const memory: MemoryEntry = {
      id: uuidv4(),
      content,
      embedding,
      tags,
      metadata: {},
      created_at: new Date(),
      updated_at: new Date(),
    };

    await this.vectorStore.upsert([memory]);
    return memory;
  }

  async searchMemories(query: string, tags?: string[]): Promise<MemoryEntry[]> {
    const queryEmbedding = await this.embeddings.embedQuery(query);
    const memories = await this.vectorStore.search(
      queryEmbedding,
      this.maxResults
    );

    if (tags && tags.length > 0) {
      return memories.filter(memory =>
        tags.some(tag => memory.tags.includes(tag))
      );
    }

    return memories;
  }

  private async extractTags(text: string): Promise<string[]> {
    // Get all existing tags
    const allTags = await this.tagManager.getTagHierarchy();
    const flatTags = this.flattenTags(allTags);
    
    // Find tags mentioned in the text
    return flatTags
      .filter(tag => 
        text.toLowerCase().includes(tag.name.toLowerCase())
      )
      .map(tag => tag.id);
  }

  private flattenTags(tags: any[]): any[] {
    return tags.reduce((flat: any[], tag: any) => {
      const flattened = [tag];
      if (tag.children) {
        flattened.push(...this.flattenTags(tag.children));
      }
      return flat.concat(flattened);
    }, []);
  }

  private augmentPrompt(
    originalPrompt: string,
    relatedMemories: MemoryEntry[]
  ): string {
    if (relatedMemories.length === 0) {
      return originalPrompt;
    }

    const relevantContext = relatedMemories
      .map(memory => memory.content)
      .join('\n\n');

    return `Context from related memories:\n${relevantContext}\n\nOriginal prompt:\n${originalPrompt}`;
  }
} 