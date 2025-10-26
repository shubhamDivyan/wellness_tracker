// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Token Management - Using sessionStorage
export const setAuthToken = (token: string | null) => {
  if (typeof window === 'undefined') return;
  
  if (token) {
    sessionStorage.setItem('authToken', token);
    localStorage.setItem('authToken', token); // Backup to localStorage too
    console.log('✅ Token saved:', token.substring(0, 20) + '...');
  } else {
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('authToken');
    console.log('🗑️ Token cleared');
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  // Try sessionStorage first, then localStorage
  let token = sessionStorage.getItem('authToken');
  if (!token) {
    token = localStorage.getItem('authToken');
  }
  if (token) {
    console.log('✅ Token retrieved:', token.substring(0, 20) + '...');
  } else {
    console.log('⚠️ No token found');
  }
  return token;
};

export const clearAuthData = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('authToken');
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('userId');
  localStorage.removeItem('userId');
  sessionStorage.removeItem('userName');
  localStorage.removeItem('userName');
  console.log('🗑️ All auth data cleared');
};

// API Helper Function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  console.log(`[API] ${options.method || 'GET'} ${endpoint}`);
  console.log(`[API] Token present: ${!!token}`);

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`[API] Full URL: ${fullUrl}`);
    
    const response = await fetch(fullUrl, config);
    const data = await response.json();

    console.log(`[API] Response status: ${response.status}`);

    if (!response.ok) {
      if (response.status === 401) {
        console.error('[API] 401 Unauthorized - clearing token');
        clearAuthData();
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
      throw new Error(data.message || `Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('[API] Request Error:', error);
    throw error;
  }
}

// ==================== AUTH API ====================
export const authAPI = {
  signup: async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      console.log('[SIGNUP] Response:', response);
      
      if (response.token) {
        setAuthToken(response.token); // Use setAuthToken for consistency
        console.log('[SIGNUP] ✅ Token saved');
      }
      
      return response;
    } catch (error) {
      console.error('[SIGNUP] Error:', error);
      throw error;
    }
  },

  login: async (credentials: { email: string; password: string }) => {
    try {
      console.log('[LOGIN API] Starting login...');
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      console.log('[LOGIN API] Response received:', response);
      
      if (response.token) {
        setAuthToken(response.token); // Save token using setAuthToken
        console.log('[LOGIN API] ✅ Token saved successfully');
      } else {
        console.error('[LOGIN API] ❌ No token in response');
        throw new Error('No token received from server');
      }
      
      return response;
    } catch (error) {
      console.error('[LOGIN API] Error:', error);
      throw error;
    }
  },

  getProfile: async () => {
    return await apiRequest('/auth/me');
  },

  updateProfile: async (profileData: { name?: string; avatar?: string }) => {
    return await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  logout: () => {
    clearAuthData();
  },
};

// ==================== HABITS API ====================
export const habitsAPI = {
  getAll: async () => {
    return await apiRequest('/habits');
  },

  getById: async (id: string) => {
    return await apiRequest(`/habits/${id}`);
  },

  create: async (habitData: {
    name: string;
    description?: string;
    icon?: string;
    target?: string;
    category?: string;
    frequency?: string;
  }) => {
    return await apiRequest('/habits', {
      method: 'POST',
      body: JSON.stringify(habitData),
    });
  },

  update: async (
    id: string,
    habitData: {
      name?: string;
      description?: string;
      icon?: string;
      target?: string;
      category?: string;
      frequency?: string;
    }
  ) => {
    return await apiRequest(`/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(habitData),
    });
  },

  delete: async (id: string) => {
    return await apiRequest(`/habits/${id}`, {
      method: 'DELETE',
    });
  },

  toggleComplete: async (id: string, notes?: string) => {
    return await apiRequest(`/habits/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ notes: notes || '' }),
    });
  },

  getTodayStatus: async () => {
    return await apiRequest('/habits/today/status');
  },
};

// ==================== STREAKS API ====================
export const streaksAPI = {
  getCalendar: async (year: number, month: number) => {
    return await apiRequest(`/streaks/calendar/${year}/${month}`);
  },

  getStats: async () => {
    return await apiRequest('/streaks/stats');
  },

  getLeaderboard: async () => {
    return await apiRequest('/streaks/leaderboard');
  },
};

// ==================== PROGRESS API ====================
export const progressAPI = {
  getWeekly: async () => {
    return await apiRequest('/progress/weekly');
  },

  getHabitsCompletion: async () => {
    return await apiRequest('/progress/habits-completion');
  },

  getMoodTrend: async () => {
    return await apiRequest('/progress/mood-trend');
  },

  logMood: async (moodData: { mood: number; notes?: string }) => {
    return await apiRequest('/progress/mood', {
      method: 'POST',
      body: JSON.stringify(moodData),
    });
  },

  getInsights: async () => {
    return await apiRequest('/progress/insights');
  },
};

// ==================== SOCIAL API ====================
export const socialAPI = {
  getFriends: async () => {
    return await apiRequest('/social/friends');
  },

  sendRequest: async (email: string) => {
    return await apiRequest('/social/friends/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  acceptRequest: async (id: string) => {
    return await apiRequest(`/social/friends/${id}/accept`, {
      method: 'PUT',
    });
  },

  removeFriend: async (id: string) => {
    return await apiRequest(`/social/friends/${id}`, {
      method: 'DELETE',
    });
  },

  getActivity: async () => {
    return await apiRequest('/social/activity');
  },

  getPending: async () => {
    return await apiRequest('/social/pending');
  },

  shareProgress: async (shareData: {
    message: string;
    type?: string;
    metadata?: any;
  }) => {
    return await apiRequest('/social/share', {
      method: 'POST',
      body: JSON.stringify(shareData),
    });
  },
};

// ==================== AI API ====================
export const aiAPI = {
  getSuggestions: async () => {
    return await apiRequest('/ai/suggestions');
  },

  acceptSuggestion: async (id: string) => {
    return await apiRequest(`/ai/suggestions/${id}/accept`, {
      method: 'POST',
    });
  },

  dismissSuggestion: async (id: string) => {
    return await apiRequest(`/ai/suggestions/${id}`, {
      method: 'DELETE',
    });
  },

  regenerate: async () => {
    return await apiRequest('/ai/regenerate', {
      method: 'POST',
    });
  },
};

// Type definitions
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  lastActive: string;
}

export interface Habit {
  _id: string;
  userId: string;
  name: string;
  description: string;
  icon: string;
  target: string;
  category: string;
  frequency: string;
  streak: number;
  bestStreak: number;
  completionCount: number;
  isActive: boolean;
  completed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Friend {
  id: string;
  name: string;
  email: string;
  avatar: string;
  streak: number;
  completionRate: number;
  lastActive: string;
  topHabit: string;
}

export interface Activity {
  id: string;
  friendName: string;
  avatar: string;
  action: string;
  icon: string;
  timestamp: string;
  metadata?: any;
}

export interface AISuggestion {
  _id: string;
  userId: string;
  habitName: string;
  description: string;
  reason: string;
  timeCommitment: string;
  difficulty: string;
  category: string;
  accepted: boolean;
  createdAt: string;
}
