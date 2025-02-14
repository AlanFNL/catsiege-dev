import axios from 'axios';

const api = axios.create({
  baseURL: 'https://catsiege-dev.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
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
     
      const response = await api.post('/auth/login', { email, password });
    
      return response.data;
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error.response?.data || { message: 'Network error' };
    }
  },

  async me() {
    try {
      const token = localStorage.getItem('tokenCat');
      
      
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.get('/user/me');
    
      
      const userData = {
        id: response.data.id || response.data._id,
        email: response.data.email,
        walletAddress: response.data.walletAddress || null,
        points: response.data.points || 0,
        isAdmin: response.data.isAdmin || false,
        quests: {
          nftVerified: response.data.quests?.nftVerified || false,
          nftHolder: response.data.quests?.nftHolder || false
        },
        completedQuests: response.data.completedQuests?.map(quest => ({
          questId: quest.questId,
          completedAt: quest.completedAt,
          lastClaim: quest.lastClaim,
          _id: quest._id
        })) || []
      };

      console.log(userData)
      return userData;
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
      return {
        completedQuests: response.data.completedQuests || [],
        points: response.data.points || 0
      };
    } catch (error) {
      console.error('Get quests error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  claimQuest: async (questId) => {
    try {
     
      
      const response = await api.post('/user/quests/claim', { questId });
      
      
      // Map the response data to ensure consistent structure
      const mappedResponse = {
        completedQuests: response.data.completedQuests?.map(quest => ({
          questId: quest.questId,
          completedAt: quest.completedAt,
          lastClaim: quest.lastClaim,
          _id: quest._id
        })) || [],
        totalPoints: response.data.totalPoints || 0,
        pointsEarned: response.data.pointsEarned || 0,
        quests: {
          nftVerified: response.data.quests?.nftVerified || false,
          nftHolder: response.data.quests?.nftHolder || false
        }
      };

     
      return mappedResponse;
    } catch (error) {
      console.error('Error claiming quest:', {
        error,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
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

  async getNFTStatus() {
    try {
      const response = await api.get('/user/nft-status');
      const nftStatus = {
        nftVerified: response.data.nftVerified || false,
        walletAddress: response.data.walletAddress || null,
        quests: {
          nftVerified: response.data.quests?.nftVerified || false,
          nftHolder: response.data.quests?.nftHolder || false
        }
      };
     
      return nftStatus;
    } catch (error) {
      console.error('Get NFT status error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },
};

export const gameService = {
  recordGameStats: async (stats) => {
    try {
      const response = await api.post('/game-stats', stats);
      return response.data;
    } catch (error) {
      console.error('Failed to record game statistics:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  getGameStats: async () => {
    try {
      const response = await api.get('/admin-stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch game statistics:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Create or resume a game session
  createGameSession: async () => {
    const response = await fetch(`${API_URL}/game/session/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('tokenCat')}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Get current game session
  getGameSession: async () => {
    const response = await fetch(`${API_URL}/game/session`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('tokenCat')}`,
      },
    });
    return handleResponse(response);
  },

  // Submit a guess
  submitGuess: async (guess) => {
    const response = await fetch(`${API_URL}/game/guess`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('tokenCat')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ guess }),
    });
    return handleResponse(response);
  },

  // End game session
  endGameSession: async () => {
    const response = await fetch(`${API_URL}/game/session/end`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('tokenCat')}`,
      },
    });
    return handleResponse(response);
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