import { API_BASE_URL } from './apiConfig';

const API_URL = `${API_BASE_URL}/api/auth`;

const AuthService = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0]?.msg || 'Login failed');
      }

      sessionStorage.setItem("jwt", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      return { token: data.token, user: data.user };
    } catch (error) {
      throw error;
    }
  },

  signup: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0]?.msg || 'Signup failed');
      }

      sessionStorage.setItem("jwt", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      return { token: data.token, user: data.user };
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    sessionStorage.removeItem("jwt");
    sessionStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const token = sessionStorage.getItem("jwt");
    const userStr = sessionStorage.getItem("user");
    if (token && userStr) {
      return JSON.parse(userStr); 
    }
    return null;
  }
};

export default AuthService;
