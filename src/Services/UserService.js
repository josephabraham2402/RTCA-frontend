import AuthService from './AuthService';

const API_URL = 'http://localhost:5000/api/users';

const getHeaders = () => {
    const token = sessionStorage.getItem("jwt");
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const UserService = {
  searchUsers: async (query) => {
    try {
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`, {
          headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to search users');
      return data;
    } catch (error) {
      console.error("Search error:", error);
      throw error;
    }
  },

  getFriendRequests: async () => {
    try {
      const response = await fetch(`${API_URL}/friend-requests`, {
          headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      throw error;
    }
  },

  sendFriendRequest: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/friend-requests`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Error sending friend request:", error);
      throw error;
    }
  },

  respondFriendRequest: async (requestId, status) => {
    try {
      const response = await fetch(`${API_URL}/friend-requests/respond`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ requestId, status }) // status is 'accept' or 'reject'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error(`Error ${status}ing friend request:`, error);
      throw error;
    }
  },

  getFriends: async () => {
    try {
      const response = await fetch(`${API_URL}/friends`, {
          headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Error fetching friends:", error);
      throw error;
    }
  }
};

export default UserService;
