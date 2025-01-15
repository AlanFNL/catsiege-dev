import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const authService = {
  async register(email, password) {
    try {
      const response = await api.post('/auth/register', { email, password });
      return response.data;
    } catch (error) {
      console.error('Register error:', error.response || error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  async login(email, password) {
    try {
      console.log('Attempting login with:', { email, password: '***' }); // Debug log
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response || error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  async me() {
    try {
      const token = localStorage.getItem('tokenCat');
      console.log('API: Fetching user data with token:', !!token);
      
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.get('/user/me');
      console.log('API: User data response:', response.data);
      
      if (!response.data.user) {
        throw new Error('Invalid response format');
      }
      
      return response.data; // Should contain { user: {...} }
    } catch (error) {
      console.error('Me error:', error.response || error);
      if (error.response?.status === 401) {
        localStorage.removeItem('tokenCat');
      }
      throw error.response?.data || { message: 'Network error' };
    }
  },

  async logout() {
    try {
      localStorage.removeItem('tokenCat');
      return { message: 'Logout successful' };
    } catch (error) {
      console.error('Logout error:', error.response || error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  async getQuests() {
    try {
      const response = await api.get('/user/quests');
      return response.data;
    } catch (error) {
      console.error('Get quests error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  async claimQuest(questId) {
    try {
      const response = await api.post('/user/quests/claim', { questId });
      return response.data;
    } catch (error) {
      console.error('Claim quest error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  async getPoints() {
    try {
      const response = await api.get('/user/points');
      return response.data;
    } catch (error) {
      console.error('Get points error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  async updatePoints(pointsChange) {
    try {
      const response = await api.post('/user/points/update', {
        points: pointsChange
      });
      return response.data;
    } catch (error) {
      console.error('Update points error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },
};

// Add request interceptor to include token in all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tokenCat');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tokenCat');
    }
    return Promise.reject(error);
  }
);