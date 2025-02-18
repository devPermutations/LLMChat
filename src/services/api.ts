import axios from 'axios';

const API_BASE_URL = 'http://localhost:11434';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 1 minute timeout
});

export const generateResponse = async (
  prompt: string,
  model: string = 'deepseek-r1:14b',
  onPartialResponse?: (partial: string) => void,
  signal?: AbortSignal
) => {
  try {
    console.log('Sending request to Ollama:', { model, prompt });
    
    const response = await fetch(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: true,
      }),
      signal, // Add abort signal to fetch request
    });

    if (!response.ok || !response.body) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      // Decode the chunk and split by newlines
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              fullResponse += data.response;
              onPartialResponse?.(data.response);
            }
          } catch (e) {
            console.error('Error parsing stream line:', e);
          }
        }
      }
    }

    console.log('Full response received:', fullResponse);
    return fullResponse;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error; // Re-throw abort errors
    }
    
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      
      if (error.response?.status === 404) {
        throw new Error(`Model ${model} not found. Please ensure it's downloaded.`);
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. The model might be busy.');
      }
    }
    
    console.error('Error details:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to generate response. Please try again.'
    );
  }
};

export default api; 