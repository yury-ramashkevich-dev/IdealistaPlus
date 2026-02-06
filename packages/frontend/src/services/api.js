import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export async function fetchPropertyData(url) {
  try {
    const response = await api.post('/scraper/property', { url });
    return response.data;
  } catch (error) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. The property page may be slow to load.');
    }
    throw new Error('Failed to connect to server. Is the backend running?');
  }
}

export default api;
