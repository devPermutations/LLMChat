import { z } from 'zod';

// Schema for memory tags
export const MemoryTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  parentId: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type MemoryTag = z.infer<typeof MemoryTagSchema>;

// Schema for memory entries
export const MemoryEntrySchema = z.object({
  id: z.string(),
  content: z.string(),
  embedding: z.array(z.number()),
  tags: z.array(z.string()),
  metadata: z.record(z.string(), z.unknown()),
  created_at: z.date(),
  updated_at: z.date(),
});

export type MemoryEntry = z.infer<typeof MemoryEntrySchema>;

// Schema for memory processing results
export const MemoryProcessingResultSchema = z.object({
  augmentedPrompt: z.string(),
  relatedMemories: z.array(MemoryEntrySchema),
  newMemories: z.array(MemoryEntrySchema),
});

export type MemoryProcessingResult = z.infer<typeof MemoryProcessingResultSchema>;

// Configuration interface for the memory system
export interface MemoryConfig {
  ollamaBaseUrl: string;
  ollamaModel: string;
  namespace: string;
  similarityThreshold: number;
  maxResults: number;
}

// Interface for the memory processor
export interface IMemoryProcessor {
  processPrompt(prompt: string): Promise<MemoryProcessingResult>;
  createMemory(content: string, tags: string[]): Promise<MemoryEntry>;
  searchMemories(query: string, tags?: string[]): Promise<MemoryEntry[]>;
}

// Interface for the tag manager
export interface ITagManager {
  createTag(name: string, parentId?: string): Promise<MemoryTag>;
  deleteTag(id: string): Promise<void>;
  getTagHierarchy(): Promise<MemoryTag[]>;
  findTagsByName(name: string): Promise<MemoryTag[]>;
}

// Interface for the vector database operations
export interface IVectorStore {
  upsert(entries: MemoryEntry[]): Promise<void>;
  search(vector: number[], limit: number): Promise<MemoryEntry[]>;
  delete(ids: string[]): Promise<void>;
  deleteNamespace(): Promise<void>;
} 