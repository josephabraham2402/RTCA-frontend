import AuthService from './AuthService';
import { API_BASE_URL } from './apiConfig';

const API_URL = `${API_BASE_URL}/api/users`;

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
  },

  removeFriend: async (friendId) => {
    try {
      const response = await fetch(`${API_URL}/friends/${friendId}`, {
          method: 'DELETE',
          headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Error removing friend:", error);
      throw error;
    }
  },

  blockUser: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/block`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Error blocking user:", error);
      throw error;
    }
  },

  getMutedChats: async () => {
    try {
      const response = await fetch(`${API_URL}/muted`, {
          headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Error fetching muted chats:", error);
      throw error;
    }
  },

  toggleMute: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/mute`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Error toggling mute:", error);
      throw error;
    }
  },

  createGroup: async (groupData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(groupData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  },

  getGroups: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups`, {
          headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Error fetching groups:", error);
      throw error;
    }
  },

  deleteGroup: async (groupId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}`, {
          method: 'DELETE',
          headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Error deleting group:", error);
      throw error;
    }
  },

  addGroupMembers: async (groupId, members) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/members`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ members })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Error adding members:", error);
      throw error;
    }
  },

  removeGroupMember: async (groupId, memberId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/members/${memberId}`, {
          method: 'DELETE',
          headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Error removing member:", error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(profileData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  updatePassword: async (passwordData) => {
    try {
      const response = await fetch(`${API_URL}/password`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(passwordData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  },

  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = sessionStorage.getItem("jwt");
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          headers: {
              'Authorization': token ? `Bearer ${token}` : ''
          },
          body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }
};

export default UserService;
