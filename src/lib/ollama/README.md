# Ollama TypeScript Client

A strongly-typed TypeScript client for interacting with local [Ollama](https://ollama.ai/) instances. This client provides a simple, type-safe way to interact with Ollama's API, with support for streaming responses, error handling, and configuration management.

## Features

- 🔒 **Type Safety**: Full TypeScript support with comprehensive type definitions
- 🌊 **Streaming Support**: Handle streaming responses with ease
- ⚡ **Async/Await**: Modern Promise-based API
- 🛠 **Configurable**: Customize base URL, model, timeout, and more
- 🔄 **Abort Support**: Cancel ongoing requests when needed
- 🚨 **Error Handling**: Standardized error handling with detailed information

## Installation

```bash
npm install @your-org/ollama-ts-client
# or
yarn add @your-org/ollama-ts-client
# or
pnpm add @your-org/ollama-ts-client
```

## Quick Start

```typescript
import { createClient } from '@your-org/ollama-ts-client';

// Create a client with default configuration
const client = createClient();

// Generate a response
const response = await client.generate({
  prompt: 'What is the capital of France?',
  onPartialResponse: (partial) => console.log('Partial:', partial),
});

console.log('Full response:', response);
```

## Configuration

### Basic Configuration

```typescript
import { createClient } from '@your-org/ollama-ts-client';

const client = createClient({
  baseUrl: 'http://localhost:11434',     // Default Ollama URL
  defaultModel: 'deepseek-r1:14b',       // Your preferred model
  timeout: 60000,                        // Timeout in milliseconds
});
```

### Environment Variables

For applications using environment variables:

```typescript
import { createClient } from '@your-org/ollama-ts-client';

const client = createClient({
  baseUrl: process.env.OLLAMA_API_URL,
  defaultModel: process.env.OLLAMA_DEFAULT_MODEL,
  timeout: parseInt(process.env.OLLAMA_TIMEOUT_MS ?? '60000'),
});
```

## Usage Examples

### Basic Generation

```typescript
const response = await client.generate({
  prompt: 'Explain quantum computing in simple terms',
});
```

### Using a Specific Model

```typescript
const response = await client.generate({
  model: 'llama2',
  prompt: 'Write a haiku about programming',
});
```

### Streaming Responses

```typescript
let fullText = '';

const response = await client.generate({
  prompt: 'Write a short story',
  onPartialResponse: (partial) => {
    fullText += partial;
    // Update UI or process partial response
    console.log('Received:', partial);
  },
});
```

### Handling Cancellation

```typescript
const abortController = new AbortController();

try {
  const response = await client.generate({
    prompt: 'Write a long essay',
    signal: abortController.signal,
  });
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request was cancelled');
  }
}

// Cancel the request
abortController.abort();
```

### Error Handling

```typescript
try {
  const response = await client.generate({
    model: 'non-existent-model',
    prompt: 'Hello',
  });
} catch (error) {
  if (error.status === 404) {
    console.error('Model not found:', error.message);
  } else if (error.code === 'ECONNABORTED') {
    console.error('Request timed out:', error.message);
  } else {
    console.error('Other error:', error.message);
  }
}
```

## Example Applications

### Chat Application

```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

class ChatApp {
  private client = createClient();
  private messages: Message[] = [];

  async sendMessage(userMessage: string) {
    // Add user message
    this.messages.push({ role: 'user', content: userMessage });

    // Format conversation history
    const prompt = this.messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    try {
      let assistantMessage = '';
      
      // Generate response with streaming
      await this.client.generate({
        prompt,
        onPartialResponse: (partial) => {
          assistantMessage += partial;
          this.updateUI(partial);
        },
      });

      // Add assistant's message to history
      this.messages.push({
        role: 'assistant',
        content: assistantMessage,
      });
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  private updateUI(text: string) {
    // Update your UI here
  }
}
```

### Code Completion Tool

```typescript
class CodeCompletionTool {
  private client = createClient({
    defaultModel: 'codellama',
    timeout: 30000,
  });

  async completeCode(
    codeContext: string,
    cursor: number,
    language: string
  ): Promise<string> {
    const prompt = `
      Language: ${language}
      Complete the following code after the cursor position (marked by |):
      
      ${codeContext.slice(0, cursor)}|${codeContext.slice(cursor)}
    `;

    try {
      return await this.client.generate({
        prompt,
        onPartialResponse: (partial) => {
          // Update IDE in real-time
          this.updateEditor(partial);
        },
      });
    } catch (error) {
      console.error('Code completion error:', error);
      throw error;
    }
  }

  private updateEditor(text: string) {
    // Update your editor here
  }
}
```

### Document Summarizer

```typescript
class DocumentSummarizer {
  private client = createClient();

  async summarizeDocument(
    document: string,
    options: {
      maxLength?: number;
      format?: 'bullet' | 'paragraph';
    } = {}
  ): Promise<string> {
    const prompt = `
      Summarize the following document${
        options.maxLength ? ` in ${options.maxLength} words or less` : ''
      }${
        options.format === 'bullet' ? ' in bullet points' : ''
      }:

      ${document}
    `;

    try {
      return await this.client.generate({
        prompt,
        onPartialResponse: (partial) => {
          // Update progress
          this.updateProgress(partial);
        },
      });
    } catch (error) {
      console.error('Summarization error:', error);
      throw error;
    }
  }

  private updateProgress(text: string) {
    // Update progress indicator
  }
}
```

## API Reference

### `OllamaClient`

The main client class for interacting with Ollama.

#### Configuration

```typescript
interface OllamaConfig {
  baseUrl: string;      // Ollama API URL
  defaultModel: string; // Default model to use
  timeout: number;      // Request timeout in ms
}
```

#### Methods

- `generate(options: GenerateRequestOptions): Promise<string>`
- `getConfig(): OllamaConfig`

### Types

```typescript
interface GenerateRequestOptions {
  model?: string;
  prompt: string;
  stream?: boolean;
  onPartialResponse?: (partial: string) => void;
  signal?: AbortSignal;
}

interface GenerateResponse {
  model: string;
  response: string;
  done: boolean;
}

interface OllamaError extends Error {
  status?: number;
  data?: unknown;
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this in your projects!

## Credits

Built with ❤️ for the Ollama community 