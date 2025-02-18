import axios from 'axios';

const API_BASE_URL = 'http://localhost:11434';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const generateResponse = async (prompt: string, model: string = 'llama2') => {
  try {
    const response = await api.post('/api/generate', {
      model,
      prompt,
      stream: false,
    });
    return response.data.response;
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response');
  }
};

export default api; 