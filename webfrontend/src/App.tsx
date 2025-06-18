import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { apiClient } from './services/api';
import type { User, BasicInfo } from './types';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      apiClient.setToken(token);
      loadUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserData = async () => {
    try {
      const [user, info] = await Promise.all([
        apiClient.getCurrentUser(),
        apiClient.getBasicInfo()
      ]);
      
      setCurrentUser(user);
      setBasicInfo(info);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Failed to load user data:', error);
      apiClient.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      apiClient.setToken(response.access_token);
      await loadUserData();
    } catch (error) {
      throw error;
    }
  };

  const handleSignup = async (nickname: string, email: string, password: string) => {
    try {
      const response = await apiClient.signup(nickname, email, password);
      apiClient.setToken(response.access_token);
      await loadUserData();
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    apiClient.clearToken();
    setCurrentUser(null);
    setBasicInfo(null);
    setIsLoggedIn(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#4387E5] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} onSignup={handleSignup} />;
  }

  return (
    <Dashboard 
      currentUser={currentUser!} 
      basicInfo={basicInfo}
      onLogout={handleLogout} 
    />
  );
}

export default App;