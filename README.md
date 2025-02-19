# LLM Chat

A modern chat interface for interacting with local LLM models through Ollama, built with React, TypeScript, and Vite.

## Features

- 🤖 Direct integration with Ollama for local LLM inference
- 💬 Clean, modern chat interface with message history
- 📊 Chat session management and analytics
- 🎨 Beautiful UI with dark mode and responsive design
- ⚡ Fast and efficient with optimized message rendering
- 🔄 Real-time model switching
- 📝 Support for markdown and special content formatting
- 📈 Message token counting and statistics

## Prerequisites

- Node.js (v18 or higher)
- [Ollama](https://ollama.ai/) installed and running locally
- A compatible LLM model pulled in Ollama (default: deepseek-r1:14b)

## Setup

1. Clone the repository:
   ```bash
   git clone [your-repo-url]
   cd llmchat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` if you need to customize any settings (e.g., different Ollama URL or default model).

4. Start Ollama (in a separate terminal):
   ```bash
   ollama serve
   ```

5. Pull the default model (or your preferred model):
   ```bash
   ollama pull deepseek-r1:14b
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/     # React components
│   ├── chat/      # Chat-specific components
│   └── ...
├── hooks/         # Custom React hooks
├── lib/           # Utility libraries
├── services/      # Service layer (API, database)
├── types/         # TypeScript type definitions
└── pages/         # Page components
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_OLLAMA_API_URL` | Ollama API endpoint | http://localhost:11434 |
| `VITE_OLLAMA_DEFAULT_MODEL` | Default LLM model | deepseek-r1:14b |
| `VITE_OLLAMA_TIMEOUT_MS` | API timeout in milliseconds | 60000 |

## Features in Detail

### Chat Interface
- Real-time message streaming
- Message history with timestamps
- Support for code blocks and special formatting
- Automatic scrolling with new messages
- Token counting and session statistics

### Session Management
- Multiple chat sessions
- Session persistence
- Session analytics and history view
- Easy session switching

### Model Integration
- Real-time model switching
- Support for multiple Ollama models
- Configurable model parameters
- Token usage tracking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [React](https://reactjs.org/)
- Powered by [Ollama](https://ollama.ai/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Bundled with [Vite](https://vitejs.dev/)
