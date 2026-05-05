import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../Services/AuthService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await AuthService.login(email, password);
    setUser(data.user);
  };

  const signup = async (email, password) => {
    const data = await AuthService.signup(email, password);
    setUser(data.user);
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
