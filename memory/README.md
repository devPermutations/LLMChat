# Memory System

A Retrieval Augmented Generation (RAG) memory system that enhances prompts with contextual information based on tags and semantic similarity. Uses local Ollama embeddings and ChromaDB for vector storage.

## Features

- Tag-based memory organization with hierarchical support
- Local vector storage using ChromaDB
- Local embeddings using Ollama's all-mini model
- Automatic tag detection in prompts
- Memory creation and retrieval
- Prompt augmentation with relevant context
- Multi-user support with isolated namespaces

## Prerequisites

1. Install Ollama:
```bash
curl https://ollama.ai/install.sh | sh
```

2. Pull the all-mini model:
```bash
ollama pull all-mini
```

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
OLLAMA_BASE_URL=http://localhost:11434  # Optional, defaults to http://localhost:11434
OLLAMA_MODEL=all-mini                   # Optional, defaults to all-mini
MEMORY_NAMESPACE=user123                # Required, unique identifier for each user
SIMILARITY_THRESHOLD=0.7                # Optional, defaults to 0.7
MAX_RESULTS=5                          # Optional, defaults to 5
CHROMA_DB_PATH=./chroma_db             # Optional, defaults to ./chroma_db
```

### Understanding Namespaces

The `MEMORY_NAMESPACE` is a crucial configuration that enables multi-user support:

- Each user should have a unique namespace (e.g., user ID, email, or UUID)
- Memories are isolated per namespace, ensuring user privacy
- Users can only access and search their own memories
- Namespaces can be deleted to remove all memories for a specific user

For example:
```typescript
// For user1
const user1Memory = new MemoryProcessor(vectorStore, tagManager, {
  namespace: 'user1',
  // ... other config
});

// For user2
const user2Memory = new MemoryProcessor(vectorStore, tagManager, {
  namespace: 'user2',
  // ... other config
});

// Delete all memories for a user
await vectorStore.deleteNamespace();
```

## Usage

```typescript
import { memorySystem } from './src';

// Process a prompt with automatic memory creation and retrieval
const result = await memorySystem.processPrompt(
  "What did John say about the project yesterday?"
);

console.log(result.augmentedPrompt); // Prompt enhanced with relevant memories
console.log(result.relatedMemories); // Array of related memories found
console.log(result.newMemories); // Array of new memories created

// Create a new memory with specific tags
const memory = await memorySystem.createMemory(
  "John mentioned the project timeline needs to be adjusted",
  ["john", "project"]
);

// Search memories
const memories = await memorySystem.searchMemories(
  "project timeline",
  ["john"]
);
```

## Architecture

The memory system consists of several key components:

1. **MemoryProcessor**: Core component that handles prompt processing, memory creation, and retrieval.
2. **VectorStore**: Manages vector embeddings and similarity search using ChromaDB (runs locally).
3. **TagManager**: Handles hierarchical tag organization and lookup.
4. **OllamaEmbeddings**: Generates embeddings using local Ollama model.
5. **Namespace Management**: Isolates memories per user and enables multi-user support.

## Benefits of Local Setup

1. **Privacy**: All data stays on your machine
2. **No API Costs**: Uses local models and storage
3. **Speed**: No network latency for embeddings or vector operations
4. **Offline Support**: Works without internet connection
5. **Customization**: Easy to modify and adapt to your needs
6. **Multi-User Support**: Isolated memory spaces for different users

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 