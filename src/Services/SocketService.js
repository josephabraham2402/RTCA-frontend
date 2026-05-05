import { io } from 'socket.io-client';
import AuthService from './AuthService';

const SOCKET_URL = 'http://localhost:5000';
let socket = null;

const SocketService = {
  connect: () => {
    if (!socket) {
      socket = io(SOCKET_URL, {
        withCredentials: true,
      });

      const user = AuthService.getCurrentUser();
      
      socket.on('connect', () => {
        console.log('Connected to socket server:', socket.id);
        // Register this user's socket to their ID room
        if (user && user.id) {
          socket.emit('register', user.id);
        }
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });
    }
    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket: () => {
    if (!socket) {
      return SocketService.connect();
    }
    return socket;
  }
};

export default SocketService;
