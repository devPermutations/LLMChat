import { ITagManager, MemoryTag } from '../core/types';
import { v4 as uuidv4 } from 'uuid';

export class InMemoryTagManager implements ITagManager {
  private tags: Map<string, MemoryTag>;

  constructor() {
    this.tags = new Map();
  }

  async createTag(name: string, parentId?: string): Promise<MemoryTag> {
    // Validate parent exists if provided
    if (parentId && !this.tags.has(parentId)) {
      throw new Error(`Parent tag with id ${parentId} not found`);
    }

    const tag: MemoryTag = {
      id: uuidv4(),
      name,
      parentId: parentId || null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.tags.set(tag.id, tag);
    return tag;
  }

  async deleteTag(id: string): Promise<void> {
    if (!this.tags.has(id)) {
      throw new Error(`Tag with id ${id} not found`);
    }

    // Check if tag has children
    const hasChildren = Array.from(this.tags.values()).some(
      tag => tag.parentId === id
    );

    if (hasChildren) {
      throw new Error(`Cannot delete tag with id ${id} as it has children`);
    }

    this.tags.delete(id);
  }

  async getTagHierarchy(): Promise<MemoryTag[]> {
    const rootTags = Array.from(this.tags.values()).filter(
      tag => !tag.parentId
    );
    return this.buildHierarchy(rootTags);
  }

  async findTagsByName(name: string): Promise<MemoryTag[]> {
    const normalizedName = name.toLowerCase();
    return Array.from(this.tags.values()).filter(tag =>
      tag.name.toLowerCase().includes(normalizedName)
    );
  }

  private buildHierarchy(tags: MemoryTag[]): MemoryTag[] {
    return tags.map(tag => {
      const children = Array.from(this.tags.values()).filter(
        child => child.parentId === tag.id
      );
      if (children.length > 0) {
        return {
          ...tag,
          children: this.buildHierarchy(children),
        };
      }
      return tag;
    });
  }
} 