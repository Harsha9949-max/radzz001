import React, { useState, useCallback, useEffect } from 'react';
import { Page, AuthMode, User } from './types';
import WelcomePage from './pages/WelcomePage';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import FuturisticBackground from './components/FuturisticBackground';

// Helper to get user from localStorage
const getStoredUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem('radzz_user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
    return null;
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<Page>('welcome');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      setPage('chat');
    }
    setIsInitialLoading(false);
  }, []);

  const handleNavigateToAuth = useCallback((mode: AuthMode) => {
    setAuthMode(mode);
    setPage('auth');
  }, []);

  const handleAuthSuccess = useCallback((authedUser: User) => {
    localStorage.setItem('radzz_user', JSON.stringify(authedUser));
    setUser(authedUser);
    setPage('chat');
  }, []);
  
  const handleUserUpdate = useCallback((updatedUser: User) => {
      localStorage.setItem('radzz_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('radzz_user');
    setUser(null);
    setPage('welcome');
  }, []);

  const renderPage = () => {
    if (isInitialLoading) {
      return <div className="flex-grow flex items-center justify-center">Loading...</div>; // Or a proper spinner
    }

    switch (page) {
      case 'welcome':
        return <WelcomePage onNavigate={handleNavigateToAuth} />;
      case 'auth':
        return <AuthPage mode={authMode} onAuthSuccess={handleAuthSuccess} onSwitchMode={handleNavigateToAuth} />;
      case 'chat':
        if (user) {
          return <ChatPage user={user} onUserUpdate={handleUserUpdate} onLogout={handleLogout} />;
        }
        // If somehow we are on 'chat' page without a user, redirect to welcome
        setPage('welcome');
        return <WelcomePage onNavigate={handleNavigateToAuth} />;
      default:
        return <WelcomePage onNavigate={handleNavigateToAuth} />;
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <FuturisticBackground />
      <div className="relative z-10 min-h-screen flex flex-col">
        {renderPage()}
      </div>
    </div>
  );
};

export default App;