import AuthService from './AuthService';

const API_URL = 'http://localhost:5000/api/messages/';

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('jwt');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const getMessages = async (userId) => {
  const response = await fetch(API_URL + userId, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch messages');
  return response.json();
};

const markAsSeen = async (messageIds, senderId) => {
  const response = await fetch(API_URL + 'mark-seen', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ messageIds, senderId })
  });
  if (!response.ok) throw new Error('Failed to mark as seen');
  return response.json();
};

export default {
  getMessages,
  markAsSeen
};
