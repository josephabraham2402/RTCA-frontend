import AuthService from './AuthService';
import { API_BASE_URL } from './apiConfig';

const API_URL = `${API_BASE_URL}/api/messages/`;

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

const uploadFile = async (file) => {
  const token = sessionStorage.getItem('jwt');
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) throw new Error('Failed to upload file');
  return response.json();
};

export default {
  getMessages,
  markAsSeen,
  uploadFile
};
