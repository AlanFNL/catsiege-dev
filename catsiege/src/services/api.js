import axios from 'axios';

const api = axios.create({
  baseURL: 'https://catsiege-dev.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add this helper function
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Network response was not ok');
  }
  return response.json();
};

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

  async requestPasswordReset(email) {
    try {
      const response = await api.post('/auth/request-reset', { email });
      return response.data;
    } catch (error) {
      console.error('Password reset request error:', error.response || error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Password reset error:', error.response || error);
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
    try {
      const response = await api.post('/game/session/create');
      return response.data;
    } catch (error) {
      console.error('Failed to create game session:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Get current game session
  getGameSession: async () => {
    try {
      const response = await api.get('/game/session');
      return response.data;
    } catch (error) {
      console.error('Failed to get game session:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Submit a guess
  submitGuess: async (guess) => {
    try {
      const response = await api.post('/game/guess', { guess });
      return response.data;
    } catch (error) {
      console.error('Failed to submit guess:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // End game session (forfeit or timeout)
  endGameSession: async () => {
    try {
      const response = await api.post('/game/session/end');
      return response.data;
    } catch (error) {
      console.error('Failed to end game session:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // === AutoBattle Game Services ===
  
  // Start an AutoBattle game - pay entry fee and collect platform fee
  startAutoBattle: async () => {
    try {
      const response = await api.post('/game/autobattle/start');
      return response.data;
    } catch (error) {
      console.error('Failed to start AutoBattle game:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },
  
  // Complete an AutoBattle game and process rewards
  completeAutoBattle: async (winner) => {
    try {
      const response = await api.post('/game/autobattle/complete', { winner });
      return response.data;
    } catch (error) {
      console.error('Failed to complete AutoBattle game:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  }
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